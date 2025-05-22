import {render, screen} from '@testing-library/react-native';
import {MessageStatusTicks} from './MessageStatusTicks';

describe('MessageStatusTicks Test Suit', () => {
  test('should render the single tick', () => {
    render(<MessageStatusTicks status="sent" />);
    expect(screen.getByText('✓')).toBeOnTheScreen();
  });
  test('should render the double tick', () => {
    render(<MessageStatusTicks status="delivered" />);
    expect(screen.getByText('✓✓')).toBeOnTheScreen();
  });
  test('should render the blue tick', () => {
    render(<MessageStatusTicks status="read" />);
    const tickElement = screen.getByText('✓✓');
    expect(tickElement).toBeOnTheScreen();
    expect(tickElement.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({color: '#FFFFFF'})]),
    );
  });
  test('should not render anything upon invalid status', () => {
    render(<MessageStatusTicks status="invalid" />);
    expect(screen.queryByText('✓')).toBeNull();
    expect(screen.queryByText('✓✓')).toBeNull();
  });
});
