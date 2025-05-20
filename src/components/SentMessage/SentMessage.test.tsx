import React from 'react';
import {render, screen} from '@testing-library/react-native';
import {SentMessage} from './SentMessage';
import {Message} from '../../types/messsage.types';

describe('SentMessage component', () => {
  const messages: Message[] = [
    {
      text: 'Message 1',
      timestamp: '2025-05-13T10:00:00',
      status: 'SENT',
    },
    {
      text: 'Message 2',
      timestamp: '2025-05-13T10:05:00',
      status: 'DELIVERED',
    },
    {
      text: 'Message 3',
      timestamp: '2025-05-13T10:10:00',
      status: 'READ',
    },
  ];
  test('Should render the correct number of messages', () => {
    render(<SentMessage sentMessages={messages} />);
    const messageTexts = screen.getAllByText(/Message \d/);
    expect(messageTexts.length).toBe(3);
  });

  test('Should display correct tick icons for each status', () => {
    render(<SentMessage sentMessages={messages} />);
    const images = screen.getAllByA11yHint('message-status-tick');

    expect(images[0].props.source.testUri).toBe('../../../src/assets/single-tick.png');
    expect(images[1].props.source.testUri).toBe('../../../src/assets/double-ticks.png');
    expect(images[2].props.source.testUri).toBe('../../../src/assets/blue-ticks.png');
  });
});
