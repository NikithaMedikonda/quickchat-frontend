import {render, screen} from '@testing-library/react-native';
import {ReceivedMessagetype} from '../../types/messsage.types';
import {ReceivedMessage} from '../ReceivedMessage/ReceivedMessage';

describe('ReceivedMessage', () => {
  const Messages: ReceivedMessagetype[] = [
    {text: 'Hello there!', timestamp: '2025-05-15T12:30:00'},
    {text: 'How are you?', timestamp: '2025-05-15T12:35:00'},
  ];

  test('Should render received messages', () => {
    render(<ReceivedMessage receivedMessages={Messages} />);

    expect(screen.getByText('Hello there!')).toBeTruthy();
    expect(screen.getByText('How are you?')).toBeTruthy();
  });

  test('Should render the correct number of message containers', () => {
    const {getAllByText} = render(
      <ReceivedMessage receivedMessages={Messages} />,
    );
    const allMessages = getAllByText(/Hello there!|How are you?/);
    expect(allMessages.length).toBe(2);
  });

  test('Should not render anything when receivedMessages is empty', () => {
    const {queryByText} = render(<ReceivedMessage receivedMessages={[]} />);
    expect(queryByText(/.+/)).toBeNull();
  });
});
