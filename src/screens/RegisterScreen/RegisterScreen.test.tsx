import { render, screen } from '@testing-library/react-native';
import RegisterScreen from './RegisterScreen';

test('basic test', () => {
  render(<RegisterScreen />);
  expect(screen.getByText('RegisterScreen')).toBeOnTheScreen();
});
