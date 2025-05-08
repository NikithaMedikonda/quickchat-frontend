import {fireEvent, render, screen} from '@testing-library/react-native';
import {WelcomeScreen} from './WelcomeScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('Welcome Screen', () => {
  it('renders the logo image', () => {
    render(<WelcomeScreen />);
    const image = screen.getByA11yHint('logo-image');
    expect(image.props.source).toEqual({
      testUri: '../../../assets/quickchat.png',
    });
  });

  it('renders the Get Started button', () => {
    const {getByText} = render(<WelcomeScreen />);
    expect(getByText('Get Started')).toBeTruthy();
  });

  it('navigates to register screen on button press', () => {
    const {getByText} = render(<WelcomeScreen />);
    const button = getByText('Get Started');
    fireEvent.press(button);
    expect(mockNavigate).toHaveBeenCalledWith('register');
  });
});
