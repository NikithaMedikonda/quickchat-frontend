import EncryptedStorage from 'react-native-encrypted-storage';
import * as connectionModule from '../connection/connection';
import {
  getMessagesByChatId,
  insertToMessages,
  updateLocalMessageStatusToRead,
  updateSendMessageStatusToDelivered,
  updateSendMessageStatusToRead,
} from '../services/messageOperations';
import {fetchAndConvertToBase64} from '../services/chatOperations';
import {sendUpdatedMessages} from '../../socket/socket';
import {store} from '../../store/store';
import {updateChatMetadata} from '../services/chatOperations';

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
jest.mock('../services/chatOperations', () => ({
  upsertChatMetadata: jest.fn(),
  updateSendMessageStatusToRead: jest.fn(),
  updateChatMetadata: jest.fn(),
  fetchAndConvertToBase64: jest.fn(() => Promise.resolve('mocked_base64_data')),
  getTotalUnreadCount: jest.fn(() => Promise.resolve(5)),
}));

jest.mock('../../store/store', () => ({
  store: {dispatch: jest.fn()},
}));
jest.mock('../../store/slices/chatSlice', () => ({
  incrementTrigger: jest.fn(() => ({type: 'INCREMENT_TRIGGER'})),
}));
jest.mock('../../socket/socket', () => ({
  sendUpdatedMessages: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  (connectionModule.getDBInstance as jest.Mock).mockResolvedValue({
    executeSql: mockExecuteSql,
  });
});

describe('Tests for updateLocalMessageStatusToRead', () => {
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
// describe('Test for updateSendMessageStatusToRead', () => {
//   it('should update the message status if the message matches', async () => {
//     mockExecuteSql.mockResolvedValueOnce([{rows: {length: 1}}]);
//     const value = {
//       senderPhoneNumber: '123',
//       receiverPhoneNumber: '456',
//       messages: ['d', 'i'],
//     };
//     await updateSendMessageStatusToRead(value);
//     expect(mockExecuteSql).toHaveBeenCalledTimes(2);
//     expect(mockExecuteSql).toHaveBeenNthCalledWith(
//       1,
//       expect.stringContaining('UPDATE Messages'),
//       ['read', value.senderPhoneNumber, value.receiverPhoneNumber, 'd'],
//     );

//     expect(mockExecuteSql).toHaveBeenNthCalledWith(
//       2,
//       expect.stringContaining('UPDATE Messages'),
//       ['read', value.senderPhoneNumber, value.receiverPhoneNumber, 'i'],
//     );
//   });
// });
describe('Test for updateSendMessageStatusToRead', () => {
  it('should update the message status if the message matches', async () => {
    mockExecuteSql.mockResolvedValue([
      {rowsAffected: 1}, // Mock this properly!
    ]);

    const value = {
      senderPhoneNumber: '123',
      receiverPhoneNumber: '456',
      messages: ['d', 'i'],
    };

    await updateSendMessageStatusToRead(value);

    expect(mockExecuteSql).toHaveBeenCalledTimes(2);
    expect(mockExecuteSql).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('UPDATE Messages'),
      [
        'read',
        value.senderPhoneNumber,
        value.receiverPhoneNumber,
        'd',
        'sent',
        'delivered',
      ],
    );

    expect(mockExecuteSql).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('UPDATE Messages'),
      [
        'read',
        value.senderPhoneNumber,
        value.receiverPhoneNumber,
        'i',
        'sent',
        'delivered',
      ],
    );
  });
});

describe('updateLocalMessageStatusToRead', () => {
  it('should update status and call sendUpdatedMessages with correct messages', async () => {
    const details = {
      senderPhoneNumber: '123',
      receiverPhoneNumber: '456',
      previousStatus: 'delivered',
      currentStatus: 'read',
    };

    const mockRows = {
      length: 2,
      item: jest
        .fn()
        .mockReturnValueOnce({message: 'hello1'})
        .mockReturnValueOnce({message: 'hello2'}),
    };

    mockExecuteSql
      .mockResolvedValueOnce([{rows: mockRows}])
      .mockResolvedValueOnce([]);

    await updateLocalMessageStatusToRead(details);

    expect(mockExecuteSql).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('SELECT * FROM Messages'),
      ['123', '456', 'delivered'],
    );

    expect(mockExecuteSql).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('UPDATE Messages'),
      ['read', '123', '456', 'delivered'],
    );

    expect(sendUpdatedMessages).toHaveBeenCalledWith({
      senderPhoneNumber: '123',
      receiverPhoneNumber: '456',
      messages: ['hello1', 'hello2'],
    });
  });

  it('should call sendUpdatedMessages with empty messages when no rows', async () => {
    const details = {
      senderPhoneNumber: '999',
      receiverPhoneNumber: '888',
      previousStatus: 'delivered',
      currentStatus: 'read',
    };

    const mockRows = {
      length: 0,
      item: jest.fn(),
    };

    mockExecuteSql
      .mockResolvedValueOnce([{rows: mockRows}])
      .mockResolvedValueOnce([]);

    await updateLocalMessageStatusToRead(details);

    expect(sendUpdatedMessages).toHaveBeenCalledWith({
      senderPhoneNumber: '999',
      receiverPhoneNumber: '888',
      messages: [],
    });
  });

  it('should throw error if SELECT query fails', async () => {
    const details = {
      senderPhoneNumber: '111',
      receiverPhoneNumber: '222',
      previousStatus: 'sent',
      currentStatus: 'read',
    };

    mockExecuteSql.mockRejectedValueOnce(new Error('SELECT failed'));

    await expect(updateLocalMessageStatusToRead(details)).rejects.toThrow(
      'SELECT failed',
    );
  });

  it('should throw error if UPDATE query fails', async () => {
    const details = {
      senderPhoneNumber: '333',
      receiverPhoneNumber: '444',
      previousStatus: 'sent',
      currentStatus: 'read',
    };

    const mockRows = {
      length: 1,
      item: jest.fn().mockReturnValue({message: 'hey'}),
    };

    mockExecuteSql
      .mockResolvedValueOnce([{rows: mockRows}])
      .mockRejectedValueOnce(new Error('UPDATE failed'));

    await expect(updateLocalMessageStatusToRead(details)).rejects.toThrow(
      'UPDATE failed',
    );
  });

  it('should handle empty fields gracefully', async () => {
    const details = {
      senderPhoneNumber: '',
      receiverPhoneNumber: '',
      previousStatus: '',
      currentStatus: 'read',
    };

    const mockRows = {
      length: 0,
      item: jest.fn(),
    };

    mockExecuteSql
      .mockResolvedValueOnce([{rows: mockRows}])
      .mockResolvedValueOnce([]);

    await updateLocalMessageStatusToRead(details);

    expect(sendUpdatedMessages).toHaveBeenCalledWith({
      senderPhoneNumber: '',
      receiverPhoneNumber: '',
      messages: [],
    });
  });
});

describe('updateSendMessageStatusToDelivered', () => {
  it('should update status, update metadata, and dispatch action', async () => {
    (connectionModule.getDBInstance as jest.Mock).mockResolvedValue({
      executeSql: mockExecuteSql,
    });

    const details = {
      senderPhoneNumber: '111',
      receiverPhoneNumber: '222',
      messages: ['hi', 'hello'],
    };

    await updateSendMessageStatusToDelivered(details);

    expect(mockExecuteSql).toHaveBeenCalledTimes(2);
    expect(updateChatMetadata).toHaveBeenCalledTimes(2);

    expect(mockExecuteSql).toHaveBeenCalledWith(expect.any(String), [
      'delivered',
      '111',
      '222',
      'hi',
    ]);
    expect(mockExecuteSql).toHaveBeenCalledWith(expect.any(String), [
      'delivered',
      '111',
      '222',
      'hello',
    ]);

    expect(updateChatMetadata).toHaveBeenCalledWith(
      '111',
      '222',
      'hi',
      'delivered',
    );
    expect(updateChatMetadata).toHaveBeenCalledWith(
      '111',
      '222',
      'hello',
      'delivered',
    );

    expect(store.dispatch).toHaveBeenCalledWith({type: 'INCREMENT_TRIGGER'});
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
