import {render, screen} from '@testing-library/react-native';
import {UnreadScreen} from './UnreadScreen';

describe('Profile Screen', () => {
  it('renders the logo image', () => {
    render(<UnreadScreen />);
    expect(screen.getByText('Hello unread')).toBeTruthy();
  });
});
