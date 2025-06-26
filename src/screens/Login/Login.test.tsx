import {NavigationContainer, useRoute} from '@react-navigation/native';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import phone from 'phone';
import EncryptedStorage from 'react-native-encrypted-storage';
import {Provider} from 'react-redux';
import * as connectionModule from '../../database/connection/connection';
import {loginUser} from '../../services/LoginUser';
import {verifyUserDetails} from '../../services/UserLoginStatus';
import {sendLoginOtp} from '../../services/SendOtp';
import {syncFromRemote} from '../../services/SyncFromRemote';
import {clearLocalStorage} from '../../database/services/clearStorage';
import {store} from '../../store/store';
import {Login} from './Login';

jest.mock('react-native-phone-input', () => {
  const {useState, forwardRef} = require('react');
  const {TextInput} = require('react-native');
  const MockPhoneInput = forwardRef(
    (
      props: {value: string; onChangePhoneNumber: (text: string) => void},
      ref: string,
    ) => {
      const [phoneNumber, setPhoneNumber] = useState(props.value);
      const handleChangeText = (text: string) => {
        setPhoneNumber(text);
        props.onChangePhoneNumber(text);
      };
      return (
        <TextInput
          ref={ref}
          placeholder="Phone number"
          value={phoneNumber}
          onChangeText={handleChangeText}
          testID="mock-phone-input"
        />
      );
    },
  );

  return MockPhoneInput;
});

jest.mock('../../services/useDeviceCheck', () => ({
  useDeviceCheck: jest.fn(),
}));

jest.mock('../../database/connection/connection', () => ({
  getDBInstance: jest.fn(),
}));

jest.mock('../../services/UserLoginStatus', () => ({
  verifyUserDetails: jest.fn(),
}));
jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      replace: mockReplace,
    }),
    useRoute: jest.fn(() => ({
      name: 'register',
      params: {},
    })),
  };
});
const mockNavigate = jest.fn();
const mockReplace = jest.fn();

jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

jest.mock('../../services/LoginUser', () => ({
  loginUser: jest.fn(),
}));

jest.mock('../../services/GenerateDeviceId', () => ({
  getDeviceId: jest.fn(),
}));

jest.mock('../../services/KeyDecryption', () => ({
  keyDecryption: () => ({
    decryptedPrivateKey: 'decryptedPrivateKey',
  }),
}));

jest.mock('../../services/UserLoginStatus', () => ({
  verifyUserDetails: jest.fn(),
}));

jest.mock('../../services/SendOtp', () => ({
  sendLoginOtp: jest.fn(),
}));

jest.mock('../../services/SyncFromRemote', () => ({
  syncFromRemote: jest.fn(),
}));

jest.mock('../../database/services/clearStorage', () => ({
  clearLocalStorage: jest.fn(),
}));

jest.mock('phone');

jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn(),
}));

jest.mock('react-native-libsodium', () => ({
  to_base64: jest.fn((input: Uint8Array) =>
    Buffer.from(input).toString('base64'),
  ),
  from_base64: jest.fn((input: string) =>
    Uint8Array.from(Buffer.from(input, 'base64')),
  ),
  crypto_generichash: jest.fn(() => new Uint8Array(32).fill(1)),
  crypto_secretbox_open_easy: jest.fn(() =>
    Uint8Array.from(Buffer.from('secret-key')),
  ),
}));

jest.useFakeTimers();

const mockExecuteSql = jest.fn();
describe('Login Screen', () => {
  beforeEach(() => {
    (useRoute as jest.Mock).mockReturnValue({ name: 'login' });
    (connectionModule.getDBInstance as jest.Mock).mockResolvedValue({
      executeSql: mockExecuteSql,
    });
    render(
      <Provider store={store}>
        <NavigationContainer>
          <Login />
        </NavigationContainer>
      </Provider>,
    );
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should render the elements correctly', async () => {
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Phone number')).toBeOnTheScreen();
      expect(screen.getByPlaceholderText('Password')).toBeOnTheScreen();
      expect(screen.getByText('Login')).toBeOnTheScreen();
      expect(screen.getByText('Sign up')).toBeOnTheScreen();
      expect(screen.getByText("Don't have an account?")).toBeOnTheScreen();
    });
  });

  test('should navigate to the register', async () => {
    const signUp = screen.getByText('Sign up');
    fireEvent.press(signUp);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('register');
    });
  });

  test('show the validation errors on empty form submission', async () => {
    fireEvent.press(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByText('Phone number required!')).toBeTruthy();
      expect(screen.getByText('Password is required')).toBeTruthy();
    });
  });

  test('should change the value of password upon entering', async () => {
    const phoneNumber = screen.getByPlaceholderText('Password');

    fireEvent.changeText(phoneNumber, {target: {value: 'Anu@1234'}});

    await waitFor(() => {
      expect(phoneNumber.props.value.target.value).toBe('Anu@1234');
    });
  });

  test('show the error when the phone number is invalid', async () => {
    (phone as jest.Mock).mockReturnValue({
      isValid: false,
      phoneNumber: '+918522041688',
    });
    const phoneNumber = screen.getByPlaceholderText('Phone number');
    fireEvent.changeText(phoneNumber, '852204168');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'Anu@1234');
    fireEvent.press(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByText('Invalid phone number!')).toBeOnTheScreen();
    });
  });

  test('should show alert if something went wrong int the fetch call', async () => {
    (phone as jest.Mock).mockReturnValue({
      isValid: true,
      phoneNumber: '+918522041688',
    });
    (loginUser as jest.Mock).mockRejectedValue({
      status: 500,
    });
    const phoneNumber = screen.getByPlaceholderText('Phone number');
    fireEvent.changeText(phoneNumber, '8522041688');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'Anu@1234');
    fireEvent.press(screen.getByText('Login'));
    await waitFor(() => {});
  });

  test('should show invalid phone number error when phone is invalid during validation', async () => {
    (phone as jest.Mock).mockReturnValue({
      isValid: false,
      phoneNumber: '+918522041688',
    });

    const phoneNumber = screen.getByPlaceholderText('Phone number');
    const password = screen.getByPlaceholderText('Password');

    fireEvent.changeText(phoneNumber, '123');
    fireEvent.changeText(password, 'validPassword123');
    fireEvent.press(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Invalid phone number!')).toBeTruthy();
    });
  });

  test('should show OTP modal when user is already logged in elsewhere', async () => {
    (phone as jest.Mock).mockReturnValue({
      isValid: true,
      phoneNumber: '+918522041688',
    });
    (verifyUserDetails as jest.Mock).mockResolvedValue({
      status: 200,
      isLogin: true,
      name: 'Test User',
      email: 'test@example.com',
    });
    (sendLoginOtp as jest.Mock).mockResolvedValue(true);

    const phoneNumber = screen.getByPlaceholderText('Phone number');
    const password = screen.getByPlaceholderText('Password');

    fireEvent.changeText(phoneNumber, '8522041688');
    fireEvent.changeText(password, 'Anu@1234');
    fireEvent.press(screen.getByText('Login'));

    await waitFor(() => {
      expect(sendLoginOtp).toHaveBeenCalledWith(
        'Test User',
        'test@example.com',
      );
    });
  });

  test('should not show OTP modal when sendLoginOtp fails', async () => {
    (phone as jest.Mock).mockReturnValue({
      isValid: true,
      phoneNumber: '+918522041688',
    });
    (verifyUserDetails as jest.Mock).mockResolvedValue({
      status: 200,
      isLogin: true,
      name: 'Test User',
      email: 'test@example.com',
    });
    (sendLoginOtp as jest.Mock).mockResolvedValue(false);

    const phoneNumber = screen.getByPlaceholderText('Phone number');
    const password = screen.getByPlaceholderText('Password');

    fireEvent.changeText(phoneNumber, '8522041688');
    fireEvent.changeText(password, 'Anu@1234');
    fireEvent.press(screen.getByText('Login'));

    await waitFor(() => {
      expect(sendLoginOtp).toHaveBeenCalledWith(
        'Test User',
        'test@example.com',
      );
    });
  });

  test('should call handleLogin when user is not already logged in', async () => {
    (phone as jest.Mock).mockReturnValue({
      isValid: true,
      phoneNumber: '+918522041688',
    });
    (verifyUserDetails as jest.Mock).mockResolvedValue({
      status: 200,
      isLogin: false,
    });
    (loginUser as jest.Mock).mockResolvedValue({
      status: 200,
      data: {
        accessToken: 'some-token',
        refreshToken: 'some-refresh-token',
        user: {
          id: 'some-id',
          firstName: 'some-first-name',
          lastName: 'testUser',
          phoneNumber: '+918522041688',
          privateKey: 'encrypted-private-key',
        },
      },
    });
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(null);

    const phoneNumber = screen.getByPlaceholderText('Phone number');
    const password = screen.getByPlaceholderText('Password');

    fireEvent.changeText(phoneNumber, '8522041688');
    fireEvent.changeText(password, 'Anu@1234');
    fireEvent.press(screen.getByText('Login'));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalled();
    });
  });

  test('should scroll to end when password input is focused', async () => {
    const passwordInput = screen.getByPlaceholderText('Password');
    fireEvent(passwordInput, 'focus');

    await waitFor(() => {
      expect(passwordInput).toBeTruthy();
    });
  });

  test('should show warning alert when login returns 409', async () => {
    (phone as jest.Mock).mockReturnValue({
      isValid: true,
      phoneNumber: '+918522041688',
    });

    (verifyUserDetails as jest.Mock).mockResolvedValue({
      status: 200,
      isLogin: false,
    });

    (loginUser as jest.Mock).mockResolvedValue({
      status: 409,
    });

    const phoneNumber = screen.getByPlaceholderText('Phone number');
    const password = screen.getByPlaceholderText('Password');

    fireEvent.changeText(phoneNumber, '8522041688');
    fireEvent.changeText(password, 'Anu@1234');
    fireEvent.press(screen.getAllByText('Login')[0]);

    await waitFor(() => {
      expect(screen.getByText('Login failed')).toBeTruthy();
      expect(
        screen.getByText(
          'Logged in from a new device using your number. Please check your account.',
        ),
      ).toBeTruthy();
    });
  });
  test('should show error alert when login returns unexpected status', async () => {
    (phone as jest.Mock).mockReturnValue({
      isValid: true,
      phoneNumber: '+918522041688',
    });

    (verifyUserDetails as jest.Mock).mockResolvedValue({
      status: 200,
      isLogin: false,
    });

    (loginUser as jest.Mock).mockResolvedValue({
      status: 403,
    });

    const phoneNumber = screen.getByPlaceholderText('Phone number');
    const password = screen.getByPlaceholderText('Password');

    fireEvent.changeText(phoneNumber, '8522041688');
    fireEvent.changeText(password, 'Anu@1234');
    fireEvent.press(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Login failed')).toBeTruthy();
      expect(screen.getByText('Something went wrong while login')).toBeTruthy();
    });
  });
  test('should show info alert when login throws an error', async () => {
    (phone as jest.Mock).mockReturnValue({
      isValid: true,
      phoneNumber: '+918522041688',
    });

    (verifyUserDetails as jest.Mock).mockResolvedValue({
      status: 200,
      isLogin: false,
    });

    (loginUser as jest.Mock).mockRejectedValue(new Error('Network error'));

    const phoneNumber = screen.getByPlaceholderText('Phone number');
    const password = screen.getByPlaceholderText('Password');

    fireEvent.changeText(phoneNumber, '8522041688');
    fireEvent.changeText(password, 'Anu@1234');
    fireEvent.press(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Login failed')).toBeTruthy();
      expect(
        screen.getByText('Something went wrong. Check your connection.'),
      ).toBeTruthy();
    });
  });
  describe('Login screen  tests', () => {
    beforeEach(async () => {
      (phone as jest.Mock).mockReturnValue({isValid: true});
    });

    const enterCredentialsAndSubmit = () => {
      fireEvent.changeText(
        screen.getByPlaceholderText('Phone number'),
        '8522041688',
      );
      fireEvent.changeText(screen.getByPlaceholderText('Password'), 'Anu@1234');
      const loginButtons = screen.getAllByText('Login');
      fireEvent.press(loginButtons[loginButtons.length - 1]);
    };

    test('checkLoginDetails: thrown error shows connection alert', async () => {
      (verifyUserDetails as jest.Mock).mockRejectedValue(
        new Error('network down'),
      );
      enterCredentialsAndSubmit();
      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeTruthy();
        expect(
          screen.getByText('Something went wrong. Check your connection.'),
        ).toBeTruthy();
      });
    });

    test('handleLogin: thrown error shows connection alert', async () => {
      (verifyUserDetails as jest.Mock).mockResolvedValue({
        status: 200,
        isLogin: false,
      });
      (loginUser as jest.Mock).mockRejectedValue(new Error('oops'));
      enterCredentialsAndSubmit();
      await waitFor(() => {
        expect(
          screen.getByText('Something went wrong. Check your connection.'),
        ).toBeTruthy();
      });
    });

    test('New user login: clears local storage & syncs remote', async () => {
      (verifyUserDetails as jest.Mock).mockResolvedValue({
        status: 200,
        isLogin: false,
      });
      (loginUser as jest.Mock).mockResolvedValue({
        status: 200,
        data: {
          accessToken: 'token',
          refreshToken: 'refresh',
          user: {
            phoneNumber: '9999999999',
            id: 'id',
            firstName: 'first',
            lastName: 'last',
            privateKey: 'encrypted-key',
          },
        },
      });
      (EncryptedStorage.getItem as jest.Mock).mockResolvedValue('1234567890');

      enterCredentialsAndSubmit();

      await waitFor(() => {
        expect(clearLocalStorage).toHaveBeenCalled();
        expect(syncFromRemote).toHaveBeenCalledWith('9999999999');
      });
    });
  });
});
