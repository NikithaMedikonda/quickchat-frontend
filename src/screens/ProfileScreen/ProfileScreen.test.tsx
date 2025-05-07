import {ProfileScreen} from './ProfileScreen';
import {render, screen} from '@testing-library/react-native';

describe('Profile Screen', () => {
  it('renders the logo image', () => {
    render(<ProfileScreen />);
    expect(screen.getByText('Hello profile')).toBeTruthy();
  });
});
