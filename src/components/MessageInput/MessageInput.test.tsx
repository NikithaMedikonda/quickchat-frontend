import {fireEvent, render, screen} from '@testing-library/react-native';
import {MessageInput} from './MessageInput';

describe('MessageInput', () => {
  test('Should render the input box with placeholder', () => {
    render(<MessageInput setMessage={jest.fn()} />);
    const input = screen.getByPlaceholderText('Type a message..');
    expect(input).toBeTruthy();
  });

  test('Should allow text to be typed in input box', () => {
    render(<MessageInput setMessage={jest.fn()} />);
    const input = screen.getByPlaceholderText('Type a message..');

    fireEvent.changeText(input, 'Hello!');
    expect(input.props.value).toBe('Hello!');
  });

  test('Should render the send message icon', () => {
    render(<MessageInput setMessage={jest.fn()} />);
    const sendIcon = screen.getByA11yHint('send-message-icon');
    expect(sendIcon).toBeTruthy();
  });
  test('Should empty the input state upon entering', () => {
    render(<MessageInput setMessage={jest.fn()} />);
    const sendIcon = screen.getByA11yHint('send-message-icon');
    fireEvent.press(sendIcon);
    const input = screen.getByPlaceholderText('Type a message..');
    expect(input.props.value).toBe('');
  });
});
