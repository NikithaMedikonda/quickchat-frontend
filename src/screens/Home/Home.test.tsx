import {render, screen} from '@testing-library/react-native';
import { Home } from './Home';

describe('Profile Screen', () => {
  it('renders the logo image', () => {
    render(<Home />);
    expect(screen.getByText('Hello home')).toBeTruthy();
  });
});

