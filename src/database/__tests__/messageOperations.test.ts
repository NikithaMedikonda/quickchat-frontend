import { createChatId } from '../../utils/chatId';
import * as connectionModule from '../connection/connection';
import {
    getMessagesByChatId,
    insertToMessages,
} from '../services/messageOperations';

const mockExecuteSql = jest.fn();

jest.mock('../connection/connection', () => ({
  getDBInstance: jest.fn(),
}));

jest.mock('../../utils/chatId', () => ({
  createChatId: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  (connectionModule.getDBInstance as jest.Mock).mockResolvedValue({
    executeSql: mockExecuteSql,
  });
});

describe('Test for insertToMessages function', () => {
  it('should insert message into Messages table', async () => {
    const message = {
      id: 'msg1',
      senderPhoneNumber: '123',
      receiverPhoneNumber: '456',
      message: 'Hello',
      timestamp: '100000',
      status: 'sent',
    };

    (createChatId as jest.Mock).mockReturnValue('chat_123_456');
    mockExecuteSql.mockResolvedValueOnce([]);

    await insertToMessages(message);

    expect(createChatId).toHaveBeenCalledWith('456', '123');
    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR IGNORE INTO Messages'),
      ['msg1', 'chat_123_456', '123', '456', 'Hello', 'sent', '100000'],
    );
  });
});

describe('Test for getMessagesByChatId function', () => {
  it('should return messages after lastClearedAt when found', async () => {
    const mockMessages = {
      rows: {
        length: 2,
        item: jest
          .fn()
          .mockReturnValueOnce({id: 1, message: 'Hi'})
          .mockReturnValueOnce({id: 2, message: 'Hello'}),
      },
    };

    const mockConversation = {
      rows: {
        length: 1,
        item: jest
          .fn()
          .mockReturnValue({lastClearedAt: '2024-01-01T00:00:00.000Z'}),
      },
    };

    mockExecuteSql
      .mockResolvedValueOnce([mockConversation])
      .mockResolvedValueOnce([mockMessages]);

    const result = await getMessagesByChatId('chat_123_456', '123');

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('SELECT lastClearedAt FROM Conversations'),
      ['chat_123_456', '123'],
    );

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM Messages'),
      ['chat_123_456', '2024-01-01T00:00:00.000Z'],
    );

    expect(result).toEqual([
      {id: 1, message: 'Hi'},
      {id: 2, message: 'Hello'},
    ]);
  });

  it('should use default date if no conversation found', async () => {
    const mockConversation = {
      rows: {length: 0, item: jest.fn()},
    };
    const mockMessages = {
      rows: {
        length: 1,
        item: jest.fn().mockReturnValue({id: 1, message: 'New Msg'}),
      },
    };

    mockExecuteSql
      .mockResolvedValueOnce([mockConversation])
      .mockResolvedValueOnce([mockMessages]);

    const result = await getMessagesByChatId('chat_xyz', '999');

    expect(result).toEqual([{id: 1, message: 'New Msg'}]);
  });
});
