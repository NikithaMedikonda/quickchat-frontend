import { render } from '@testing-library/react-native';
import WelcomeScreen from './WelcomeScreen';

describe('Welcome Screen', () => {
    it('renders the logo image', () => {
      const { getByTestId } = render(<WelcomeScreen />);
      const image = getByTestId('logo-image');
      expect(image).toBeTruthy();
    });
})