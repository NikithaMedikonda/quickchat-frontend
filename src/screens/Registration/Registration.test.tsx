import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { resetForm } from '../../store/slices/registrationSlice';
import { store } from '../../store/store';
import { Registration } from './Registration';


jest.mock('react-native-image-crop-picker', () => ({
  openPicker: jest.fn().mockResolvedValue({path: 'mocked/image/path.jpg'}),
}));

jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(),
}));

jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn(),
}));

jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn(),
}));

jest.mock('../../services/GenerateDeviceId', () => ({
  getDeviceId: jest.fn(),
}));

jest.mock('react-native-phone-input', () => {
  const React = require('react');
  const {TextInput} = require('react-native');
  const MockPhoneInput = React.forwardRef(
    (
      props: {value?: string; onChangePhoneNumber: (value: string) => void},
      ref: string,
    ) => {
      const [text, setText] = React.useState('');
      return (
        <TextInput
          ref={ref}
          placeholder="Phone number"
          value={text}
          onChangeText={(value: string) => {
            setText(value);
            props.onChangePhoneNumber(value);
          }}
          testID="mock-phone-input"
        />
      );
    },
  );
  return MockPhoneInput;
});

jest.mock('react-native-fs', () => ({
  readFile: jest.fn().mockResolvedValue('mockedBase64Image'),
}));

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      replace: mockReplace,
    }),
  };
});

jest.mock('../../permissions/ImagePermissions', () => ({
  requestPermissions: jest.fn(),
}));

jest.mock('../../services/RegisterUser.ts', () => ({
  registerUser: jest.fn(),
}));

jest.mock('../../services/KeyGeneration', () => ({
  keyGeneration: jest.fn().mockResolvedValue({
    publicKey: 'mock-public-key',
    privateKey: 'mock-private-key',
  }),
}));

jest.mock('react-native-libsodium', () => ({
  crypto_box_keypair: jest.fn(),
  to_base64: jest.fn((input: Uint8Array) =>
    Buffer.from(input).toString('base64'),
  ),
  crypto_generichash: jest.fn(() => new Uint8Array(32).fill(1)),
  crypto_secretbox_easy: jest.fn(() => new Uint8Array(64).fill(2)),
  randombytes_buf: jest.fn(() => new Uint8Array(24).fill(3)),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str,
  }),
}));


const mockNavigate = jest.fn();
const mockReplace = jest.fn();

describe('Registration Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.dispatch(resetForm());
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <NavigationContainer>
            <Registration />
        </NavigationContainer>
      </Provider>,
    );

  it('renders all input fields and buttons', () => {
    const {getByPlaceholderText, getByText} = renderComponent();
    expect(getByPlaceholderText('First Name')).toBeTruthy();
    expect(getByPlaceholderText('Last Name')).toBeTruthy();
    expect(getByPlaceholderText('Phone number')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    expect(getByPlaceholderText('Email (Optional)')).toBeTruthy();
    expect(getByText('Register')).toBeTruthy();
    expect(getByText('Sign in')).toBeTruthy();
  });

  it('shows validation errors on empty form submission', async () => {
    const {getByText} = renderComponent();
    fireEvent.press(getByText('Register'));
    await waitFor(() => {
      expect(getByText('First name required!')).toBeTruthy();
      expect(getByText('Last name required!')).toBeTruthy();
      expect(getByText('Invalid password!')).toBeTruthy();
    });
  });

it('should activate image picker modal', async () => {
  const {getByAccessibilityHint} = renderComponent();
  fireEvent.press(getByAccessibilityHint('logo'));
  await waitFor(() => {
    const state = store.getState();
    expect(state.registration.isVisible).toBe(true);
  });
});

  it('shows password mismatch error', async () => {
    const {getByPlaceholderText, getByText} = renderComponent();
    fireEvent.changeText(getByPlaceholderText('Password'), 'Password@1');
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'Password@2',
    );
    fireEvent.press(getByText('Register'));
    await waitFor(() => {
      expect(getByText('Passwords do not match!')).toBeTruthy();
    });
  });

  it('shows invalid password error', async () => {
    const {getByPlaceholderText, getByText} = renderComponent();
    fireEvent.changeText(getByPlaceholderText('Password'), '12345678');
    fireEvent.press(getByText('Register'));
    await waitFor(() => {
      expect(getByText('Invalid password!')).toBeTruthy();
    });
  });


  it('should check the phone number', async () => {
    const {getByPlaceholderText, getByText} = renderComponent();
    fireEvent.changeText(getByPlaceholderText('Phone number'), '');
    fireEvent.press(getByText('Register'));
    await waitFor(() => {
      expect(getByText('Phone number required!')).toBeTruthy();
    });
  });


  it('should check the length of phone number', async () => {
    const {getByPlaceholderText, getByText} = renderComponent();
    fireEvent.changeText(getByPlaceholderText('Phone number'), '123456');
    fireEvent.press(getByText('Register'));
    await waitFor(() => {
      expect(getByText('Invalid phone number!')).toBeTruthy();
    });
  });

  it('shows invalid email error', async () => {
    const {getByPlaceholderText, getByText} = renderComponent();
    fireEvent.changeText(
      getByPlaceholderText('Email (Optional)'),
      'invalid-email',
    );
    fireEvent.press(getByText('Register'));
    await waitFor(() => {
      expect(getByText('Invalid email format!')).toBeTruthy();
    });
  });

  it('navigates to login screen', async () => {
    const {getByText} = renderComponent();
    fireEvent.press(getByText('Sign in'));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('login');
    });
  });

  it('successfully submits form with valid data', async () => {
    const {registerUser} = require('../../services/RegisterUser.ts');
    registerUser.mockResolvedValue({
      status: 200,
      data: {
        accessToken: 'mockedToken',
        refreshToken: 'refreshToken',
        user: {},
        deviceId:'qdshjgdjfwgrwfhk',
      },
    });

    const {getByPlaceholderText, getByText} = renderComponent();

    fireEvent.changeText(getByPlaceholderText('First Name'), 'test');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'user');
    fireEvent.changeText(getByPlaceholderText('Phone number'), '1234567890');
    fireEvent.changeText(getByPlaceholderText('Password'), 'Password@123');
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'Password@123',
    );
    fireEvent.changeText(
      getByPlaceholderText('Email (Optional)'),
      'testuser@gmail.com',
    );

    fireEvent.press(getByText('Register'));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('hometabs');
    });
  });

  it('shows already exists error (409)', async () => {
    const {registerUser} = require('../../services/RegisterUser.ts');
    registerUser.mockResolvedValue({
      status: 409,
    });

    const {getByPlaceholderText, getByText} = renderComponent();

    fireEvent.changeText(getByPlaceholderText('First Name'), 'test');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'user');
    fireEvent.changeText(getByPlaceholderText('Phone number'), '1234567890');
    fireEvent.changeText(getByPlaceholderText('Password'), 'Password@123');
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'Password@123',
    );
    fireEvent.changeText(
      getByPlaceholderText('Email (Optional)'),
      'user@gmail.com',
    );

    fireEvent.press(getByText('Register'));

    await waitFor(() => {
    const state = store.getState();
    expect(state.registration.alertMessage).toBe('User already exists with this number or email');
    expect(state.registration.alertType).toBe('error');
  });
  });

  it('shows generic error if server fails', async () => {
    const {registerUser} = require('../../services/RegisterUser.ts');
    registerUser.mockResolvedValue({
      status: 500,
    });

    const {getByPlaceholderText, getByText} = renderComponent();

    fireEvent.changeText(getByPlaceholderText('First Name'), 'Test');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'User');
    fireEvent.changeText(getByPlaceholderText('Phone number'), '1234567890');
    fireEvent.changeText(getByPlaceholderText('Password'), 'Password@123');
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'Password@123',
    );
    fireEvent.changeText(
      getByPlaceholderText('Email (Optional)'),
      'user@gmail.com',
    );

    fireEvent.press(getByText('Register'));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalled();
const state = store.getState();
    expect(state.registration.alertMessage).toBe('Something went wrong while registering');
    expect(state.registration.alertType).toBe('error');
    });
  });

    it('shows generic error if server fails with error message', async () => {
    const {registerUser} = require('../../services/RegisterUser.ts');
    registerUser.mockRejectedValue(new Error('Server failure'));

    const {getByPlaceholderText, getByText} = renderComponent();

    fireEvent.changeText(getByPlaceholderText('First Name'), 'Test');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'User');
    fireEvent.changeText(getByPlaceholderText('Phone number'), '1234567890');
    fireEvent.changeText(getByPlaceholderText('Password'), 'Password@123');
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'Password@123',
    );
    fireEvent.changeText(
      getByPlaceholderText('Email (Optional)'),
      'user@gmail.com',
    );

    fireEvent.press(getByText('Register'));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalled();
    const state = store.getState();
    expect(state.registration.alertMessage).toBe('Please check your internet');
    expect(state.registration.alertType).toBe('info');
    });
  });
});
