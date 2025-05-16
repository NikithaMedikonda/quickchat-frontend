import {Alert} from 'react-native';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {Registration} from './Registration';
import {store} from '../../store/store';

jest.mock('react-native-image-crop-picker', () => ({
  openPicker: jest.fn().mockResolvedValue({path: 'mocked/image/path.jpg'}),
}));

jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(),
}));

jest.mock('react-native-phone-input', () => {
  const React = require('react');
  const { TextInput } = require('react-native');
  const MockPhoneInput = React.forwardRef((props: { value: any; onChangePhoneNumber: any; }, ref: any) => {
    return (
      <TextInput
        ref={ref}
        placeholder="Phone number"
        value={props.value}
        onChangeText={props.onChangePhoneNumber}
        testID="mock-phone-input"
      />
    );
  });
  return MockPhoneInput;
});

jest.mock('react-native-fs', () => ({
  readFile: jest.fn().mockResolvedValue('mockedBase64Image'),
}));

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      replace:mockReplace,
    }),
  };
});

jest.mock('../../permissions/ImagePermissions', () => ({
  requestPermissions: jest.fn(),
}));

jest.mock('../../services/RegisterUser.ts', () => ({
  registerUser: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('Registration Screen', () => {
  afterEach(() => {
    jest.resetAllMocks();
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
      expect(getByText('First name is required')).toBeTruthy();
      expect(getByText('Last name is required')).toBeTruthy();
      expect(getByText('Invalid password')).toBeTruthy();
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
      expect(getByText('Passwords do not match')).toBeTruthy();
    });
  });
  it('shows invalid pass error', async () => {
    const {getByPlaceholderText, getByText} = renderComponent();
    fireEvent.changeText(getByPlaceholderText('Password'), '12345678');
    fireEvent.press(getByText('Register'));
    await waitFor(() => {
      expect(getByText('Invalid password')).toBeTruthy();
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
      expect(getByText('Invalid email format')).toBeTruthy();
    });
  });

  it('should navigate to login screen', async () => {
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
      data: {accessToken: 'mockedToken', refreshToken: 'refreshToken'},
    });
    const {getByPlaceholderText, getByText} = renderComponent();
    fireEvent.changeText(getByPlaceholderText('First Name'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'testuser');
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
  it('User already exist with this number', async () => {
    const {registerUser} = require('../../services/RegisterUser.ts');
    registerUser.mockResolvedValue({
      status: 409,
      data: {accessToken: 'mockedToken', refreshToken: 'refreshToken'},
    });
    const {getByPlaceholderText, getByText} = renderComponent();
    fireEvent.changeText(getByPlaceholderText('First Name'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'testuser');
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
      expect(registerUser).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        'User already exists with this number or email',
      );
    });
  });
  it('should check failed statements', async () => {
    const {registerUser} = require('../../services/RegisterUser.ts');
    registerUser.mockResolvedValue({
      status: 500,
      data: {accessToken: 'mockedToken', refreshToken: 'refreshToken'},
    });
    const {getByPlaceholderText, getByText} = renderComponent();
    fireEvent.changeText(getByPlaceholderText('First Name'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'testuser');
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
      expect(registerUser).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Something went wrong while registering',
      );
    });
  });

  it('shows error alert if API call fails', async () => {
    const {registerUser} = require('../../services/RegisterUser.ts');
    registerUser.mockRejectedValue(new Error('Network error or something unexpected happened'));
    const {getByPlaceholderText, getByText} = renderComponent();
    fireEvent.changeText(getByPlaceholderText('First Name'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Phone number'), '1234567890');
    fireEvent.changeText(getByPlaceholderText('Password'), 'Password@123');
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'Password@123',
    );
    fireEvent.press(getByText('Register'));
    expect(registerUser).toHaveBeenCalled();
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Network error or something unexpected happened');
    });
  });
});
