import {render, screen} from '@testing-library/react-native';
import { Unread } from './Unread';
jest.mock('../../services/useDeviceCheck', () => ({
  useDeviceCheck: jest.fn(),
}));
describe('Profile Screen', () => {
  it('renders the logo image', () => {
    render(<Unread />);
    expect(screen.getByText('Hello unread')).toBeTruthy();
  });
});
