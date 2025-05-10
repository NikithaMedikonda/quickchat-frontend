import {render, screen} from '@testing-library/react-native';
import { Profile } from './Profile';

describe('Profile Screen', () => {
  it('renders the logo image', () => {
    render(<Profile />);
    expect(screen.getByText('Hello profile')).toBeTruthy();
  });
});
