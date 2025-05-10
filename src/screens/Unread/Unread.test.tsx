import {render, screen} from '@testing-library/react-native';
import { Unread } from './Unread';

describe('Profile Screen', () => {
  it('renders the logo image', () => {
    render(<Unread />);
    expect(screen.getByText('Hello unread')).toBeTruthy();
  });
});
