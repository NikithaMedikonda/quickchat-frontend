import {render, screen} from '@testing-library/react-native';
import {ProfileScreen} from './ProfileScreen';

describe('Profile Screen', () => {
  it('renders the logo image', () => {
    render(<ProfileScreen />);
    expect(screen.getByText('Hello profile')).toBeTruthy();
  });
});
