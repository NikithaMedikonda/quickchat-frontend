import {AllMessages} from '../types/messsage.types';
import {GroupMessagesByDate} from './GroupMessagesByDate';
const mockChats: AllMessages[] = [
  {
    recipientPhoneNumber: '8978363862',
    message: 'hi',
    senderPhoneNumber: '7893615293',
    timestamp: '2025-06-10T11:30:00Z',
    status: 'Sent',
  },
  {
    recipientPhoneNumber: '8978363862',
    message: 'hello',
    senderPhoneNumber: '7893615293',
    timestamp: '2025-06-09T11:30:00Z',
    status: 'Sent',
  },
  {
    recipientPhoneNumber: '8978363862',
    message: 'hello',
    senderPhoneNumber: '7893615293',
    timestamp: '2025-06-08T11:30:00Z',
    status: 'Sent',
  },
  {
    recipientPhoneNumber: '8978363862',
    message: 'hello',
    senderPhoneNumber: '7893615293',
    timestamp: '2025-05-25T11:30:00Z',
    status: 'Sent',
  },
];

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-06-10T12:00:00Z').getTime());
});

afterAll(() => {
  jest.useRealTimers();
});

describe('GroupMessagesByDate', () => {
  test('should contain correct messages under each label', () => {
    const grouped = GroupMessagesByDate(mockChats);

    expect(grouped.Today[0].timestamp).toBe('2025-06-10T11:30:00Z');
    expect(grouped.Yesterday[0].timestamp).toBe('2025-06-09T11:30:00Z');
    expect(grouped.Sunday[0].timestamp).toBe('2025-06-08T11:30:00Z');
    expect(grouped['May 25, 2025'][0].timestamp).toBe('2025-05-25T11:30:00Z');
  });
});
