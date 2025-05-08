import { HomeScreen } from './HomeScreen';
import {render, screen} from '@testing-library/react-native';

describe('Profile Screen', () => {
  it('renders the logo image', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Hello home')).toBeTruthy();
  });
});

