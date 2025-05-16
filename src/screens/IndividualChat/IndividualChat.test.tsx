import {render, screen} from '@testing-library/react-native';
import {IndividualChat} from './IndividualChat';
import {fireEvent} from '@testing-library/react-native';
import {Platform} from 'react-native';
describe('Individual chat screen tests', () => {
  test('Should render the return icon, to go back to home screen', () => {
    render(<IndividualChat receivedMessage={'hiii'} />);
    const returnIcon = screen.getByA11yHint('return-icon');
    expect(returnIcon).toBeTruthy();
  });
  test('Should render the more options icon', () => {
    render(<IndividualChat receivedMessage={'hiii'} />);
    const image = screen.getByA11yHint('more-options-icon');
    expect(image).toBeTruthy();
  });

  test('Should render the send icon', () => {
    render(<IndividualChat receivedMessage={'hiii'} />);
    const image = screen.getByA11yHint('send-message-icon');
    expect(image).toBeTruthy();
  });
  test('Should render the input field for chat input', () => {
    render(<IndividualChat receivedMessage="Hello" />);
    const input = screen.getByPlaceholderText('Type a message..');
    expect(input).toBeTruthy();
  });
  test('Should display the received message', () => {
    render(<IndividualChat receivedMessage="Hello there" />);
    expect(screen.getByText('Hello there')).toBeTruthy();
  });
  test('Should add a sent message when send button is pressed', () => {
    render(<IndividualChat receivedMessage="Hi" />);

    const input = screen.getByPlaceholderText('Type a message..');
    fireEvent.changeText(input, 'Hello!');

    const sendButton = screen.getByA11yHint('send-message-icon');
    fireEvent.press(sendButton);

    expect(screen.getByText('Hello!')).toBeTruthy();
  });
  test('Should not send an empty message', () => {
    render(<IndividualChat receivedMessage="Hi" />);

    const sendButton = screen.getByA11yHint('send-message-icon');
    fireEvent.press(sendButton);

    expect(screen.queryByText('')).toBeNull();
  });
  test('Should render the sent message with the correct tick icon', () => {
    render(<IndividualChat receivedMessage="Hi" />);

    const input = screen.getByPlaceholderText('Type a message..');
    fireEvent.changeText(input, 'Hey!');

    const sendButton = screen.getByA11yHint('send-message-icon');
    fireEvent.press(sendButton);

    const sentTick = screen.getByA11yHint('sent-tick');
    expect(sentTick).toBeTruthy();
  });
  test('Should render the correct icon based on current platform', () => {
    const {getByA11yHint} = render(<IndividualChat receivedMessage="Hi" />);
    const image = getByA11yHint('return-icon');

    const expectedSource =
      Platform.OS === 'ios'
        ? require('../../assets/ios-return-icon.png')
        : require('../../assets/return-icon.png');

    expect(image.props.source).toEqual(expectedSource);
  });
});
