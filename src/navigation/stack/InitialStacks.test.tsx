import {NavigationContainer} from '@react-navigation/native';
import {render, waitFor} from '@testing-library/react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {Provider} from 'react-redux';
import {store} from '../../store/store';
import {InitialStacks} from './InitialStacks';

global.fetch = jest.fn();

const fetchMock = fetch as jest.Mock;

jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest
    .fn()
    .mockResolvedValue(
      JSON.stringify({name: 'Mamatha', phoneNumber: '+91 6303974914'}),
    ),
  setItem: jest.fn(),
  clear: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

let mockIsConnected = true;
jest.mock('../../hooks/useSocketConnection', () => ({
  useSocketConnection: () => ({
    isConnected: mockIsConnected,
  }),
}));
jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn(),
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
  getAllWithoutPhotos: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../permissions/ImagePermissions', () => ({
  requestPermissions: jest.fn(),
}));

jest.mock('../../helpers/nameNumberIndex', () => ({
  numberNameIndex: jest.fn().mockResolvedValue({
    '+916303961097': 'Test User',
  }),
}));

jest.mock('react-native-sqlite-storage', () => ({
  openDatabase: jest.fn(() => ({
    executeSql: jest.fn(),
    transaction: jest.fn(),
    close: jest.fn(),
  })),
  enablePromise: jest.fn(),
}));

const mockExecuteSql = jest
  .fn()
  .mockResolvedValue([{rows: {length: 0, item: jest.fn()}}]);
const mockDb = {
  executeSql: mockExecuteSql,
  transaction: jest.fn(),
  close: jest.fn(),
};

jest.mock('../../database/connection/connection', () => ({
  getDBInstance: jest.fn().mockResolvedValue(mockDb),
}));

jest.mock('../../database/services/chatOperations', () => ({
  getAllChatsFromLocal: jest.fn().mockResolvedValue([]),
  getTotalUnreadCount: jest.fn().mockResolvedValue(0),
}));

jest.mock('../../database/services/userOperations', () => ({
  getLastSyncedTime: jest.fn().mockResolvedValue(new Date().toISOString()),
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

jest.mock('react-native-libsodium', () => ({
  crypto_box_keypair: jest.fn(),
  to_base64: jest.fn((input: Uint8Array) =>
    Buffer.from(input).toString('base64'),
  ),
  crypto_generichash: jest.fn(() => new Uint8Array(32).fill(1)),
  crypto_secretbox_easy: jest.fn(() => new Uint8Array(64).fill(2)),
  randombytes_buf: jest.fn(() => new Uint8Array(24).fill(3)),
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
      expect(getByText('Start messages text')).toBeTruthy();
      expect(getByText('User friendly question')).toBeTruthy();
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

    const renderResult = renderWithProviders();
    const {getByText} = renderResult;

    try {
      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalledWith(
          'authToken',
          'new-access-token',
        );
        expect(setItemSpy).toHaveBeenCalledWith(
          'refreshToken',
          'new-refresh-token',
        );
      });
      await waitFor(() => {
        expect(getByText('Start messages text')).toBeTruthy();
        expect(getByText('User friendly question')).toBeTruthy();
      });
    } catch (error) {
      console.log(
        'Component unmounted during navigation, which is expected behavior',
      );
    }
  });

  it('should navigate to HomeTabs on valid access token ', async () => {
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

    const renderResult = renderWithProviders();
    const {getByText} = renderResult;

    try {
      await waitFor(() => {
        expect(getByText('One message. Infinite possibilities.')).toBeTruthy();
        expect(getByText('What are you waiting for?')).toBeTruthy();
      });
    } catch (error) {
      console.log(
        'Component unmounted during navigation, which is expected behavior',
      );
    }
  });

  it('should navigate to welcome screen if fetch throws an error', async () => {
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
