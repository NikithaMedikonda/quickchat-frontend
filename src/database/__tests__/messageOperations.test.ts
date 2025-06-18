import EncryptedStorage from 'react-native-encrypted-storage';
import * as connectionModule from '../connection/connection';
import {
  getMessagesByChatId,
  insertToMessages,
  updateLocalMessageStatusToRead,
} from '../services/messageOperations';
import { fetchAndConvertToBase64 } from '../services/chatOperations';

const mockExecuteSql = jest.fn();

jest.mock('../connection/connection', () => ({
  getDBInstance: jest.fn(),
}));
jest.mock('../../utils/chatId', () => ({
  createChatId: jest.fn(() => 'chat_123_456'),
}));
jest.mock('rn-fetch-blob', () => ({
  config: jest.fn(() => ({
    fetch: jest.fn(() =>
      Promise.resolve({
        base64: jest.fn(() => Promise.resolve('mocked_base64_data')),
      }),
    ),
  })),
}));
jest.mock('../services/chatOperations', () => ({
  upsertChatMetadata: jest.fn(),
  fetchAndConvertToBase64: jest.fn(() => Promise.resolve('mocked_base64_data')),
}));

jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(),
}));
jest.mock('../services/userOperations', () => ({
  isUserStoredLocally: jest.fn(),
  upsertUserInfo: jest.fn(),
}));
jest.mock('../../services/GetUser', () => ({
  getUserByPhoneNumber: jest.fn(),
}));
jest.mock('../../store/store', () => ({
  store: {dispatch: jest.fn()},
}));
jest.mock('../../store/slices/chatSlice', () => ({
  incrementTrigger: jest.fn(() => ({type: 'INCREMENT_TRIGGER'})),
}));

beforeEach(() => {
  jest.clearAllMocks();
  (connectionModule.getDBInstance as jest.Mock).mockResolvedValue({
    executeSql: mockExecuteSql,
  });
});



describe('Tests for updateLocalMessageStatusToRead', () => {
  it('should update message status with correct SQL and params', async () => {
    const details = {
      senderPhoneNumber: '111',
      receiverPhoneNumber: '222',
      previousStatus: 'delivered',
      currentStatus: 'read',
    };

    mockExecuteSql.mockResolvedValueOnce([]);

    await expect(
      updateLocalMessageStatusToRead(details),
    ).resolves.toBeUndefined();

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE Messages'),
      ['read', '222', '111', 'delivered'],
    );
  });

  it('should propagate errors from executeSql', async () => {
    const details = {
      senderPhoneNumber: '111',
      receiverPhoneNumber: '222',
      previousStatus: 'delivered',
      currentStatus: 'read',
    };

    mockExecuteSql.mockRejectedValueOnce(new Error('SQL error'));

    await expect(updateLocalMessageStatusToRead(details)).rejects.toThrow(
      'SQL error',
    );
  });
  it('should return early if currentUserPhoneNumber is not present', async () => {
    mockExecuteSql.mockResolvedValueOnce([
      {rows: {length: 0, item: jest.fn()}},
    ]);
    mockExecuteSql.mockResolvedValueOnce([]);
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({}),
    );

    const message = {
      id: '1',
      senderPhoneNumber: '123',
      receiverPhoneNumber: '456',
      message: 'Hello',
      status: 'sent',
      timestamp: '1000',
    };

    await insertToMessages(message);
    const {upsertChatMetadata} = require('../services/chatOperations');
    const {store} = require('../../store/store');
    expect(upsertChatMetadata).not.toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalled();
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
describe('Tests for insertToMesssages', () => {
  it('should return early if message already exists', async () => {
    mockExecuteSql.mockResolvedValueOnce([{rows: {length: 1}}]);
    const message = {
      id: '1',
      senderPhoneNumber: '123',
      receiverPhoneNumber: '456',
      message: 'Hello',
      status: 'sent',
      timestamp: '1000',
    };
    await insertToMessages(message);
    expect(mockExecuteSql).toHaveBeenCalledTimes(1);
  });

  it('should return early if no current user', async () => {
    mockExecuteSql.mockResolvedValueOnce([
      {rows: {length: 0, item: jest.fn()}},
    ]);
    mockExecuteSql.mockResolvedValueOnce([]);
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const message = {
      id: '1',
      senderPhoneNumber: '123',
      receiverPhoneNumber: '456',
      message: 'Hello',
      status: 'sent',
      timestamp: '1000',
    };
    await insertToMessages(message);
    expect(mockExecuteSql).toHaveBeenCalledTimes(2);
  });

  it('should handle sender as current user', async () => {
    mockExecuteSql.mockResolvedValueOnce([
      {rows: {length: 0, item: jest.fn()}},
    ]);
    mockExecuteSql.mockResolvedValueOnce([]);
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({phoneNumber: '123'}),
    );
    const message = {
      id: '1',
      senderPhoneNumber: '123',
      receiverPhoneNumber: '456',
      message: 'Hello',
      status: 'sent',
      timestamp: '1000',
    };
    await insertToMessages(message);
    const {upsertChatMetadata} = require('../services/chatOperations');
    expect(upsertChatMetadata).toHaveBeenCalledWith(
      '123',
      '456',
      'Hello',
      '1000',
      'sent',
      true,
    );
  });

  it('should handle sender is not current user and user exists locally', async () => {
    mockExecuteSql.mockResolvedValueOnce([
      {rows: {length: 0, item: jest.fn()}},
    ]);
    mockExecuteSql.mockResolvedValueOnce([]);
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({phoneNumber: '999'}),
    );
    const {isUserStoredLocally} = require('../services/userOperations');
    isUserStoredLocally.mockResolvedValueOnce(true);
    const message = {
      id: '1',
      senderPhoneNumber: '123',
      receiverPhoneNumber: '456',
      message: 'Hello',
      status: 'sent',
      timestamp: '1000',
    };
    await insertToMessages(message);
    expect(isUserStoredLocally).toHaveBeenCalled();
    const {upsertChatMetadata} = require('../services/chatOperations');
    expect(upsertChatMetadata).toHaveBeenCalledWith(
      '123',
      '456',
      'Hello',
      '1000',
      'sent',
      false,
    );
  });



  it('should handle sender is not current user, user not stored locally, remote user not found', async () => {
    mockExecuteSql.mockResolvedValueOnce([
      {rows: {length: 0, item: jest.fn()}},
    ]);
    mockExecuteSql.mockResolvedValueOnce([]);
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({phoneNumber: '999'}),
    );
    const {
      isUserStoredLocally,
      upsertUserInfo,
    } = require('../services/userOperations');
    isUserStoredLocally.mockResolvedValueOnce(false);
    const {getUserByPhoneNumber} = require('../../services/GetUser');
    getUserByPhoneNumber.mockResolvedValueOnce(null);
    const message = {
      id: '1',
      senderPhoneNumber: '123',
      receiverPhoneNumber: '456',
      message: 'Hello',
      status: 'sent',
      timestamp: '1000',
    };
    await insertToMessages(message);
    expect(getUserByPhoneNumber).toHaveBeenCalledWith('123');
    expect(upsertUserInfo).not.toHaveBeenCalled();
  });
    it('should handle sender is not current user, user not stored locally, remote user found', async () => {
    mockExecuteSql.mockResolvedValueOnce([
      {rows: {length: 0, item: jest.fn()}},
    ]);
    mockExecuteSql.mockResolvedValueOnce([]);
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({phoneNumber: '999'}),
    );
    const {
      isUserStoredLocally,
      upsertUserInfo,
    } = require('../services/userOperations');
    isUserStoredLocally.mockResolvedValueOnce(false);
    const {getUserByPhoneNumber} = require('../../services/GetUser');
    getUserByPhoneNumber.mockResolvedValueOnce({
      profilePicture: 'mocked_base64_data',
      publicKey: 'pub',
    });
    (fetchAndConvertToBase64 as jest.Mock).mockResolvedValue(
      'mocked_base64_data',
    );
    const message = {
      id: '1',
      senderPhoneNumber: '123',
      receiverPhoneNumber: '456',
      message: 'Hello',
      status: 'sent',
      timestamp: '1000',
    };
    await insertToMessages(message);
    expect(getUserByPhoneNumber).toHaveBeenCalledWith('123');
    expect(upsertUserInfo).toHaveBeenCalledWith(expect.anything(), {
      phoneNumber: '123',
      profilePicture: 'mocked_base64_data',
      publicKey: 'pub',
    });
  });
});