import { createChatId } from '../../utils/chatId';
import * as connectionModule from '../connection/connection';
import {
    deleteFromQueue,
    getQueuedMessages,
    insertToQueue,
    updateMessageStatus,
} from '../services/queueOperations';
import { MessageType } from '../types/message';

const mockExecuteSql = jest.fn();

jest.mock('../connection/connection', () => ({
  getDBInstance: jest.fn(),
}));

jest.mock('../../utils/chatId', () => ({
  createChatId: jest.fn(),
}));

describe('Tests for insertToQueue function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (connectionModule.getDBInstance as jest.Mock).mockResolvedValue({
      executeSql: mockExecuteSql,
    });
  });

  it('should insert a message into the Queue table', async () => {
    const message: MessageType = {
      id: 'msg1',
      senderPhoneNumber: '111',
      receiverPhoneNumber: '222',
      message: 'Hi!',
      timestamp: '1000',
      status: 'pending',
    };

    (createChatId as jest.Mock).mockReturnValue('chat_111_222');
    mockExecuteSql.mockResolvedValueOnce([]);

    await insertToQueue(message);

    expect(createChatId).toHaveBeenCalledWith('222', '111');
    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO Queue'),
      ['msg1', 'chat_111_222', '111', '222', 'Hi!', '1000', 'pending'],
    );
  });
});

describe('Test for getQueuedMessages function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (connectionModule.getDBInstance as jest.Mock).mockResolvedValue({
      executeSql: mockExecuteSql,
    });
  });
  it('should return messages from the Queue table', async () => {
    const mockResults = {
      rows: {
        length: 2,
        item: jest
          .fn()
          .mockReturnValueOnce({id: 'msg1', message: 'Hey'})
          .mockReturnValueOnce({id: 'msg2', message: 'Yo'}),
      },
    };

    mockExecuteSql.mockResolvedValueOnce([mockResults]);

    const messages = await getQueuedMessages('chat_111_222');

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM Queue'),
      ['chat_111_222'],
    );

    expect(messages).toEqual([
      {id: 'msg1', message: 'Hey'},
      {id: 'msg2', message: 'Yo'},
    ]);
  });
});

describe('Test for updateMessageStatus function', () => {
  it('should update message status in the Messages table', async () => {
    const message: MessageType = {
      id: 'msg1',
      senderPhoneNumber: '111',
      receiverPhoneNumber: '222',
      message: 'Hello again',
      timestamp: '1000',
      status: 'sent',
    };

    mockExecuteSql.mockResolvedValueOnce([]);

    await updateMessageStatus(message);

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining(
        'UPDATE Messages SET status = ?, message = ? WHERE id = ?',
      ),
      ['sent', 'Hello again', 'msg1'],
    );
  });
});

describe('deleteFromQueue', () => {
  it('should delete a message from the Queue table by id', async () => {
    mockExecuteSql.mockResolvedValueOnce([]);

    await deleteFromQueue('msg1');

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM Queue WHERE id = ?'),
      ['msg1'],
    );
  });
});
