import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Welcome } from './Welcome';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('Welcome Screen', () => {
  it('renders the logo image', () => {
    render(<Welcome />);
    const image = screen.getByA11yHint('logo-image');
    expect(image.props.source).toEqual({
      testUri: '../../../src/assets/QuickChatDarkLogo.png',
    });
  });

  it('renders the Get Started button', () => {
    const { getByText } = render(<Welcome />);
    expect(getByText('Get Started')).toBeTruthy();
  });

  it('navigates to register screen on button press', async () => {
    const { getByText } = render(<Welcome />);
    const button = getByText('Get Started');
    await waitFor(() => {
      fireEvent.press(button);
    });
    expect(mockNavigate).toHaveBeenCalledWith('register');
  });
});
