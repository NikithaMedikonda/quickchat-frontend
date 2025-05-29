import {render} from '@testing-library/react-native';
import {MessageStatusTicks} from './MessageStatusTicks';

jest.mock('../../assets/sent.png', () => 'sentImageMock');
jest.mock('../../assets/delivered.png', () => 'deliveredImageMock');
jest.mock('../../assets/readTick.png', () => 'readImageMock');

describe('MessageStatusTicks Test Suit', () => {
  test('should render the single tick', () => {
    const { getByA11yHint } = render(<MessageStatusTicks status="sent" />);
    const image = getByA11yHint('Message status is sent');
    expect(image.props.source).toBe('sentImageMock');
  });
  test('should render the double tick', () => {
    const { getByA11yHint } = render(<MessageStatusTicks status="delivered" />);
    const image = getByA11yHint('Message status is delivered');
    expect(image.props.source).toBe('deliveredImageMock');
  });
  test('should render the blue tick', () => {
    const { getByA11yHint } = render(<MessageStatusTicks status="read" />);
    const image = getByA11yHint('Message status is read');
    expect(image.props.source).toBe('readImageMock');
  });
  test('should not render anything upon invalid status', () => {
    const { toJSON } = render(<MessageStatusTicks status="invalid" />);
    expect(toJSON()).toBeNull();
  });
});
