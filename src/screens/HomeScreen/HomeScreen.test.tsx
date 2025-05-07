import {render, screen} from '@testing-library/react-native';
import { HomeScreen } from './HomeScreen';

describe('Profile Screen', () => {
  it('renders the logo image', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Hello home')).toBeTruthy();
  });
});

