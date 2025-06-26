import {render, fireEvent, act} from '@testing-library/react-native';
import {OtpInputModal} from './OtpInputModal';
import {useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {TouchableWithoutFeedback} from 'react-native';

global.fetch = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(() => jest.fn()),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    replace: jest.fn(),
  })),
  useRoute: jest.fn(() => ({
    name: 'register',
    params: {},
  })),
}));

describe('Test for OtpInputModal', () => {
  const mockSetOtp = jest.fn();
  const mockSetIsVisible = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockResendHandler = jest.fn();

  const setup = (props = {}) => {
    return render(
      <OtpInputModal
        visible={true}
        setIsVisible={mockSetIsVisible}
        otp={''}
        setOtp={mockSetOtp}
        email={'test@example.com'}
        onSuccess={mockOnSuccess}
        resendHandler={mockResendHandler}
        {...props}
      />,
    );
  };

  beforeEach(() => {
    (fetch as jest.Mock).mockReset();
    jest.clearAllMocks();
  });

  it('renders modal and updates OTP input', () => {
    const {getByText, getByLabelText} = setup();
    expect(getByText('Verification code required')).toBeTruthy();
    fireEvent.changeText(getByLabelText('One-Time Password'), '1234');
  });

  it('validates OTP successfully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({isverified: true}),
    });

    const {getByText, getByLabelText} = setup({otp: '1234'});
    fireEvent.changeText(getByLabelText('One-Time Password'), '1234');
    await act(async () => {
      fireEvent.press(getByText('Validate OTP'));
    });

    expect(mockSetIsVisible).toHaveBeenCalledWith(false);
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('shows error on 410 status (expired)', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 410,
      json: async () => ({}),
    });
    const {getByText, findByText, getByLabelText} = setup({otp: '1234'});
    fireEvent.changeText(getByLabelText('One-Time Password'), '1234');

    await act(async () => {
      fireEvent.press(getByText('Validate OTP'));
    });

    expect(await findByText('OTP expired. Please try once again')).toBeTruthy();
  });
  it('shows error on 401 status (invalid)', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    });
    const {getByText, getByLabelText, findByText} = setup({otp: '1234'});
    fireEvent.changeText(getByLabelText('One-Time Password'), '1234');

    await act(async () => {
      fireEvent.press(getByText('Validate OTP'));
    });

    expect(await findByText('Invalid OTP')).toBeTruthy();
  });
  it('shows general error on other failures', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Server error'));
    const {getByText, getByLabelText, findByText} = setup({otp: '1234'});
    fireEvent.changeText(getByLabelText('One-Time Password'), '1234');

    await act(async () => {
      fireEvent.press(getByText('Validate OTP'));
    });

    expect(
      await findByText('Something went wrong. Please try again later.'),
    ).toBeTruthy();
  });

  it('resends OTP and updates info after timer ends', async () => {
    jest.useFakeTimers();
    const {getByText} = setup();
    act(() => {
      jest.advanceTimersByTime(120_000);
    });
    await act(async () => {
      fireEvent.press(getByText('Resend'));
    });
    expect(mockResendHandler).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('redirects to registration screen on OTP failure after resend', async () => {
    jest.useFakeTimers();

    const mockDispatch = jest.fn();
    const mockNavigation = {replace: jest.fn()};

    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);

    const {getByText, getByLabelText} = setup({otp: '1234'});

    act(() => {
      jest.advanceTimersByTime(120000);
    });

    await act(async () => {
      fireEvent.press(getByText('Resend'));
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    });

    fireEvent.changeText(getByLabelText('One-Time Password'), '1234');

    await act(async () => {
      fireEvent.press(getByText('Validate OTP'));
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'registration/setAlertType',
      payload: 'info',
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'registration/setAlertTitle',
      payload: 'Redirecting...',
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'registration/setAlertMessage',
      payload: 'Taking you to the registration screen to restart the process.',
    });
    expect(mockDispatch).toHaveBeenCalledWith({type: 'registration/resetForm'});
    expect(mockDispatch).toHaveBeenCalledWith({type: 'login/resetLoginForm'});
    expect(mockNavigation.replace).toHaveBeenCalledWith('register');
    jest.useRealTimers();
  });

  it('closes modal when tapping outside (TouchableWithoutFeedback)', () => {
    const {UNSAFE_getAllByType} = setup();
    const touchables = UNSAFE_getAllByType(TouchableWithoutFeedback);
    fireEvent.press(touchables[0]);
    expect(mockSetIsVisible).toHaveBeenCalledWith(false);
  });

  it('shows general error when status is unknown and not 401/410', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });
    const {getByText, findByText, getByLabelText} = setup({otp: '1234'});
    fireEvent.changeText(getByLabelText('One-Time Password'), '1234');

    await act(async () => {
      fireEvent.press(getByText('Validate OTP'));
    });

    expect(
      await findByText('Something went wrong. Please try again later.'),
    ).toBeTruthy();
  });

  it('disables Validate OTP button when otp is empty', () => {
    const {getByTestId} = setup({otp: ''});
    const button = getByTestId('validate-otp-btn');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });
});
