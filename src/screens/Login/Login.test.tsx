import {NavigationContainer} from '@react-navigation/native';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import phone from 'phone';
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

describe('Login Screen', () => {
  beforeEach(() => {
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
    await waitFor(() => {});
  });
  test('should show alert if user not existed with this phone number', async () => {
    (phone as jest.Mock).mockReturnValue({
      isValid: true,
      phoneNumber: '+918522041688',
    });
    (loginUser as jest.Mock).mockResolvedValue({
      status: 404,
      data: {
        message: 'User not found',
      },
    });

    const phoneNumber = screen.getByPlaceholderText('Phone number');
    fireEvent.changeText(phoneNumber, '8522041688');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'Anu@1234');
    fireEvent.press(screen.getByText('Login'));

    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertMessage).toBe(
        'No account exists with this phone number',
      );
      expect(state.registration.alertType).toBe('error');
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
      const state = store.getState();
      expect(state.registration.alertMessage).toBe(
        'Incorrect phone number or password. Please try again.',
      );
      expect(state.registration.alertType).toBe('warning');
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
          privateKey: 'encrypted-private-key',
        },
      },
    });

    const phoneNumber = screen.getByPlaceholderText('Phone number');
    fireEvent.changeText(phoneNumber, '8522041688');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'Anu@1234');
    fireEvent.press(screen.getByText('Login'));
    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertType).toBe('success');
      expect(state.registration.alertMessage).toBe('Successfully login');
    });

    jest.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('hometabs');
    });
  });
  test('should show alert if login failed with server error', async () => {
    (phone as jest.Mock).mockReturnValue({
      isValid: true,
      phoneNumber: '+918522041688',
    });
    (loginUser as jest.Mock).mockResolvedValue({
      status: 500,
      data: {
        message: 'Internal server error',
      },
    });

    const phoneNumber = screen.getByPlaceholderText('Phone number');
    fireEvent.changeText(phoneNumber, '8522041688');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'Anu@1234');
    fireEvent.press(screen.getByText('Login'));

    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertMessage).toBe(
        'Something went wrong while login',
      );
      expect(state.registration.alertType).toBe('error');
    });
  });
});
