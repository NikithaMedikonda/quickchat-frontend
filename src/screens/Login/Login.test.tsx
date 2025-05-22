import {NavigationContainer} from '@react-navigation/native';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import phone from 'phone';
import {AlertNotificationRoot, Dialog} from 'react-native-alert-notification';
import {Provider} from 'react-redux';
import {loginUser} from '../../services/LoginUser';
import {store} from '../../store/store';
import {Login} from './Login';

jest.mock('react-native-phone-input', () => {
  const {useState, forwardRef} = require('react');
  const {TextInput} = require('react-native');
  const MockPhoneInput = forwardRef(
    (props: {value: any; onChangePhoneNumber: any}, ref: any) => {
      const [phoneNumber, setPhoneNumber] = useState(props.value);

      const handleChangeText = (text: any) => {
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

const mockNavigate = jest.fn();
const mockReplace = jest.fn();

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

jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(),
}));

jest.mock('../../services/LoginUser', () => ({
  loginUser: jest.fn(),
}));

jest.mock('../../services/KeyDecryption', () => ({
  keyDecryption: () => ({
    decryptedPrivateKey: 'decryptedPrivateKey',
  }),
}));

jest.mock('phone');

jest.mock('react-native-libsodium', () => ({
  to_base64: jest.fn((input: Uint8Array) => Buffer.from(input).toString('base64')),
  from_base64: jest.fn((input: string) => Uint8Array.from(Buffer.from(input, 'base64'))),
  crypto_generichash: jest.fn(() => new Uint8Array(32).fill(1)),
  crypto_secretbox_open_easy: jest.fn(() =>  Uint8Array.from(Buffer.from('secret-key'))),
}));

jest.mock('react-native-alert-notification', () => ({
  AlertNotificationRoot: ({children}: any) => <>{children}</>,
  Toast: {show: jest.fn()},
  Dialog: {show: jest.fn()},
  ALERT_TYPE: {SUCCESS: 'success', DANGER: 'danger'},
}));

describe('Login Screen', () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <NavigationContainer>
          <AlertNotificationRoot>
            <Login />
          </AlertNotificationRoot>
        </NavigationContainer>
      </Provider>,
    );
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should render the elements correctly', () => {
    expect(screen.getByPlaceholderText('Phone number')).toBeOnTheScreen();
    expect(screen.getByPlaceholderText('Password')).toBeOnTheScreen();
    expect(screen.getByText('Login')).toBeOnTheScreen();
    expect(screen.getByText('Sign up')).toBeOnTheScreen();
    expect(screen.getByText("Don't have an account?")).toBeOnTheScreen();
  });

  test('should navigate to the register', () => {
    const signUp = screen.getByText('Sign up');
    fireEvent.press(signUp);
    expect(mockNavigate).toHaveBeenCalledWith('register');
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
    await waitFor(() => {
      expect(Dialog.show).toHaveBeenCalledWith({
        type: 'danger',
        title: 'Login failed',
        textBody: 'Something went wrong',
        button: 'close',
        closeOnOverlayTap: true,
      });
    });
  });
  test('should show alert if user not existed with this phone number', async () => {
    (phone as jest.Mock).mockReturnValue({
      isValid: true,
      phoneNumber: '+918522041688',
    });
    (loginUser as jest.Mock).mockResolvedValue({
      status: 404,
      data: {
        accessToken: 'some-token',
        refreshToken: 'some-refresh-token',
        user: {
          id: 'some-id',
          firstName: 'some-first-name',
          lastName: 'testUser',
          phoneNumber: '+918522041688',
        },
      },
    });
    const phoneNumber = screen.getByPlaceholderText('Phone number');
    fireEvent.changeText(phoneNumber, '8522041688');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'Anu@1234');
    fireEvent.press(screen.getByText('Login'));
    await waitFor(() => {
      expect(Dialog.show).toHaveBeenCalledWith({
        type: 'danger',
        title: 'Login failed',
        textBody: 'No account exists with this phone number',
        button: 'close',
        closeOnOverlayTap: true,
      });
    });
  });

  test('should show alert if user entered the wrong password', async () => {
    (phone as jest.Mock).mockReturnValue({
      isValid: true,
      phoneNumber: '+918522041688',
    });
    (loginUser as jest.Mock).mockResolvedValue({
      status: 401,
      data: {
        accessToken: 'some-token',
        refreshToken: 'some-refresh-token',
        user: {
          id: 'some-id',
          firstName: 'some-first-name',
          lastName: 'testUser',
          phoneNumber: '+918522041688',
        },
      },
    });
    const phoneNumber = screen.getByPlaceholderText('Phone number');
    fireEvent.changeText(phoneNumber, '8522041688');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'Anu@1234');
    fireEvent.press(screen.getByText('Login'));
    await waitFor(() => {
      expect(Dialog.show).toHaveBeenCalledWith({
        type: 'danger',
        title: 'Login failed',
        textBody: 'Invalid credentials!',
        button: 'close',
        closeOnOverlayTap: true,
      });
    });
  });
  test('should navigate to the hometabs upon successful login', async () => {
    (phone as jest.Mock).mockReturnValue({
      isValid: true,
      phoneNumber: '+918522041688',
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
        },
      },
    });

    const phoneNumber = screen.getByPlaceholderText('Phone number');
    fireEvent.changeText(phoneNumber, '8522041688');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'Anu@1234');
    fireEvent.press(screen.getByText('Login'));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('hometabs');
    });
  });
  test('should show alert if login failed', async () => {
    (phone as jest.Mock).mockReturnValue({
      isValid: true,
      phoneNumber: '+918522041688',
    });
    (loginUser as jest.Mock).mockResolvedValue({
      status: 500,
      data: {
        accessToken: 'some-token',
        refreshToken: 'some-refresh-token',
        user: {
          id: 'some-id',
          firstName: 'some-first-name',
          lastName: 'testUser',
          phoneNumber: '+918522041688',
        },
      },
    });
    const phoneNumber = screen.getByPlaceholderText('Phone number');
    fireEvent.changeText(phoneNumber, '8522041688');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'Anu@1234');
    fireEvent.press(screen.getByText('Login'));
    await waitFor(() => {
      expect(Dialog.show).toHaveBeenCalledWith({
        type: 'danger',
        title: 'Login failed',
        textBody: 'Something went wrong while login',
        button: 'close',
        closeOnOverlayTap: true,
      });
    });
  });
});
