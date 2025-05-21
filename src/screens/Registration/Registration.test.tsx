import {fireEvent, render, waitFor} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {store} from '../../store/store';
import {Registration} from './Registration';
import {AlertNotificationRoot, Dialog} from 'react-native-alert-notification';
import {resetForm} from '../../store/slices/registrationSlice';

jest.mock('react-native-image-crop-picker', () => ({
  openPicker: jest.fn().mockResolvedValue({path: 'mocked/image/path.jpg'}),
}));

jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(),
}));

jest.mock('react-native-phone-input', () => {
  const React = require('react');
  const {TextInput} = require('react-native');
  const MockPhoneInput = React.forwardRef(
    (props: {value?: string; onChangePhoneNumber: (value: string) => void;}, ref: string) => {
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

jest.mock('crypto-js', () => ({
  AES: {
    encrypt: jest.fn(() => ({
      toString: jest.fn(() => 'mock-encrypted-value'),
    })),
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str,
  }),
}));

jest.mock('react-native-alert-notification', () => ({
  AlertNotificationRoot: ({children}: any) => <>{children}</>,
  Toast: {show: jest.fn()},
  Dialog: {show: jest.fn()},
  ALERT_TYPE: {SUCCESS: 'success', DANGER: 'danger'},
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
          <AlertNotificationRoot>
            <Registration />
          </AlertNotificationRoot>
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
      expect(mockNavigate).toHaveBeenCalledWith('login');
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
      expect(registerUser).toHaveBeenCalled();
      expect(Dialog.show).toHaveBeenCalledWith({
        type: 'danger',
        title: 'Registration failed',
        textBody: 'User already exists with this number or email',
        button: 'close',
        closeOnOverlayTap: true,
      });
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
      expect(Dialog.show).toHaveBeenCalledWith({
        type: 'danger',
        title: 'Registration failed',
        textBody: 'Something went wrong while registering',
        button: 'close',
        closeOnOverlayTap: true,
      });
    });
  });
});

