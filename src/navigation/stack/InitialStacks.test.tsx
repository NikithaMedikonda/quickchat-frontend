import EncryptedStorage from 'react-native-encrypted-storage';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {render, waitFor} from '@testing-library/react-native';
import {InitialStacks} from './InitialStacks';
import {store} from '../../store/store';

global.fetch = jest.fn();

const fetchMock = fetch as jest.Mock;

jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('react-native-image-crop-picker', () => ({
  openPicker: jest.fn(),
  openCamera: jest.fn(),
}));

jest.mock('react-native-fs', () => ({
  readFile: jest.fn().mockResolvedValue('mockedBase64Image'),
}));
jest.mock('react-native-contacts', () => ({
  getContactsByPhoneNumber: jest.fn(),
}));
jest.mock('../../permissions/ImagePermissions', () => ({
  requestPermissions: jest.fn(),
}));

jest.mock('react-native-phone-input', () => {
  const React = require('react');
  const {TextInput} = require('react-native');
  const MockPhoneInput = React.forwardRef(
    (props: {value: string; onChangePhoneNumber: () => {}}, ref: string) => {
      return (
        <TextInput
          ref={ref}
          placeholder="Phone number"
          value={props.value}
          onChangeText={props.onChangePhoneNumber}
          testID="mock-phone-input"
        />
      );
    },
  );
  return MockPhoneInput;
});

jest.mock('react-native-rsa', () => {
  return jest.fn().mockImplementation(() => ({
    encrypt: jest.fn((data) => `mock-rsa-encrypted(${data})`),
    decrypt: jest.fn((data) => data.replace('mock-rsa-encrypted(', '').replace(')', '')),
  }));
});

jest.mock('crypto-js', () => ({
  AES: {
    encrypt: jest.fn(() => ({
      toString: jest.fn(() => 'mock-encrypted-value'),
    })),
  },
}));

jest.mock('crypto-js', () => ({
  AES: {
    decrypt: jest.fn(() => ({
      toString: jest.fn(() => 'secret-key'),
    })),
  },
}));


describe('InitialStacks', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const renderWithProviders = () =>
    render(
      <Provider store={store}>
        <NavigationContainer>
          <InitialStacks />
        </NavigationContainer>
      </Provider>,
    );

  it('should show loading initially', async () => {
    const {getByTestId} = renderWithProviders();
    await waitFor(() => {
      expect(getByTestId('loading-spinner')).toBeTruthy();
    });
  });

  it('should show Welcome screen if no tokens are found', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => {
        if (key === 'user' || key === 'authToken' || key === 'refreshToken') {
          return null;
        }
      },
    );

    const {getByText} = renderWithProviders();

    await waitFor(() => {
      expect(getByText(/Get Started/i)).toBeTruthy();
    });
  });

  it('should clear EncryptedStorage and navigate to Welcome if tokens are invalid', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => {
        if (key === 'user') {
          return JSON.stringify({name: 'Test'});
        }
        if (key === 'authToken') {
          return 'invalid-access-token';
        }
        if (key === 'refreshToken') {
          return 'invalid-refresh-token';
        }
      },
    );

    fetchMock.mockResolvedValueOnce({
      json: async () => ({message: 'Invalid access token'}),
    });

    const allRemoveSpy = jest.spyOn(EncryptedStorage, 'clear');

    const {getByText} = renderWithProviders();

    await waitFor(() => {
      expect(allRemoveSpy).toHaveBeenCalledTimes(1);
      expect(getByText(/Get Started/i)).toBeTruthy();
    });
  });

  it('should navigate to HomeTabs on valid access token', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => {
        if (key === 'user') {
          return JSON.stringify({name: 'Test'});
        }
        if (key === 'authToken') {
          return 'valid-token';
        }
        if (key === 'refreshToken') {
          return 'refresh-token';
        }
      },
    );

    fetchMock.mockResolvedValue({
      json: async () => ({message: 'Access token valid'}),
    });

    const {getByText} = renderWithProviders();

    await waitFor(() => {
      expect(getByText('One message. Infinite possibilities.')).toBeTruthy();
      expect(getByText('What are you waiting for?')).toBeTruthy();
    });
  });

  it('should store new tokens if access token is refreshed', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => {
        if (key === 'user') {
          return JSON.stringify({name: 'Test'});
        }
        if (key === 'authToken') {
          return 'old-access-token';
        }
        if (key === 'refreshToken') {
          return 'old-refresh-token';
        }
        return null;
      },
    );

    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        message: 'New access token issued',
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      }),
    });

    const setItemSpy = jest.spyOn(EncryptedStorage, 'setItem');

    const {getByText} = renderWithProviders();

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith('authToken', 'new-access-token');
      expect(setItemSpy).toHaveBeenCalledWith(
        'refreshToken',
        'new-refresh-token',
      );
      expect(getByText('One message. Infinite possibilities.')).toBeTruthy();
      expect(getByText('What are you waiting for?')).toBeTruthy();
    });
  });

  it('should naviavgte to welcome screen if fetch throws an error', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => {
        if (key === 'user') {
          return JSON.stringify({name: 'Test'});
        }
        if (key === 'authToken') {
          return 'some-token';
        }
        if (key === 'refreshToken') {
          return 'some-refresh-token';
        }
        return null;
      },
    );

    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    const {getByText} = renderWithProviders();

    await waitFor(() => {
      expect(getByText(/Get Started/i)).toBeTruthy();
    });
  });
});
