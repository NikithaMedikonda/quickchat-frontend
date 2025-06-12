import { getUserByPhoneNumber } from '../../services/GetUser';
import { setUnreadCount } from '../../store/slices/unreadChatSlice';
import { store } from '../../store/store';
import * as connectionModule from '../connection/connection';
import {
  clearChatLocally,
  getAllChatsFromLocal,
  getTotalUnreadCount,
  resetUnreadCount,
  upsertChatMetadata,
} from '../services/chatOperations';
import { isUserStoredLocally, upsertUserInfo } from '../services/userOperations';

const mockExecuteSql = jest.fn();

jest.mock('../connection/connection', () => ({
  getDBInstance: jest.fn(),
}));

jest.mock('../../helpers/nameNumberIndex', () => ({
  numberNameIndex: jest.fn().mockResolvedValue({'999': 'Test User'}),
}));
jest.mock('../../helpers/normalisePhoneNumber', () => ({
  normalise: jest.fn((num: string) => num),
}));
jest.mock('../services/userOperations', () => ({
  isUserStoredLocally: jest.fn().mockResolvedValue(true),
  upsertUserInfo: jest.fn(),
}));
jest.mock('../../services/GetUser', () => ({
  getUserByPhoneNumber: jest.fn(),
}));
jest.mock('../../store/store', () => ({
  store: {dispatch: jest.fn()},
}));
jest.mock('../../store/slices/unreadChatSlice', () => ({
  setUnreadCount: jest.fn(),
}));
jest.mock('../../utils/chatId', () => ({
  createChatId: jest.fn(() => 'chat_123_456'),
}));

beforeEach(() => {
  jest.clearAllMocks();
  (connectionModule.getDBInstance as jest.Mock).mockResolvedValue({
    executeSql: mockExecuteSql,
  });
});

describe('Tests for clearChatLocally function', () => {
  const chatId = 'chat123';
  const userPhoneNumber = '1234567890';
  const timestamp = Date.now();

  it('should update conversation if record exists', async () => {
    (connectionModule.getDBInstance as jest.Mock).mockResolvedValue({
      executeSql: mockExecuteSql.mockImplementation(query => {
        if (query.startsWith('SELECT')) {
          return Promise.resolve([{rows: {length: 1, item: () => ({})}}]);
        }
        return Promise.resolve();
      }),
    });

    await clearChatLocally(chatId, userPhoneNumber, timestamp);

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM Conversations'),
      [chatId, userPhoneNumber],
    );
    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE Conversations'),
      [expect.any(String), chatId, userPhoneNumber],
    );
  });

  it('should insert conversation if no record exists', async () => {
    (connectionModule.getDBInstance as jest.Mock).mockResolvedValue({
      executeSql: mockExecuteSql.mockImplementation(query => {
        if (query.startsWith('SELECT')) {
          return Promise.resolve([{rows: {length: 0, item: () => null}}]);
        }
        return Promise.resolve();
      }),
    });

    await clearChatLocally(chatId, userPhoneNumber, timestamp);
    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM Conversations'),
      [chatId, userPhoneNumber],
    );
    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO Conversations'),
      [chatId, userPhoneNumber, expect.any(String)],
    );
  });
});

describe('Tests for upsertChatMetadata', () => {
  it('should upsert chat metadata and update unread count', async () => {
    mockExecuteSql
      .mockResolvedValueOnce([
        {rows: {length: 1, item: () => ({unReadCount: 2})}},
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{rows: {item: () => ({unreadChats: 3})}}]);
    await upsertChatMetadata('123', '456', 'Hello', '100000', 'sent', true);

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('SELECT unReadCount FROM Chats WHERE id = ?'),
      ['chat_123_456'],
    );
    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO Chats'),
      ['chat_123_456', '123', '456', 'Hello', '100000', 'sent', 'sent', 2],
    );
    expect(store.dispatch).toHaveBeenCalledWith(setUnreadCount(3));
  });
});

describe('Tests for resetUnreadCount', () => {
  it('should reset unread count for a chat', async () => {
    const db = {executeSql: mockExecuteSql};
    await resetUnreadCount(db as any, 'chat_123_456');
    expect(mockExecuteSql).toHaveBeenCalledWith(
      'UPDATE Chats SET unReadCount = 0 WHERE id = ?',
      ['chat_123_456'],
    );
  });
});

describe('Tests for getTotalUnreadCount', () => {
  it('should return total unread chats', async () => {
    mockExecuteSql.mockResolvedValueOnce([
      {rows: {item: () => ({unreadChats: 5})}},
    ]);
    const db = {executeSql: mockExecuteSql};
    const count = await getTotalUnreadCount(db as any);
    expect(count).toBe(5);
    expect(mockExecuteSql).toHaveBeenCalledWith(
      'SELECT COUNT(*) as unreadChats FROM Chats WHERE unReadCount > 0',
    );
  });
});

describe('Tests for getAllChatsFromLocal', () => {
  it('should return all chats with local user info', async () => {
    mockExecuteSql
      .mockResolvedValueOnce([
        {
          rows: {
            length: 1,
            item: () => ({
              id: 'chat_123_456',
              userAPhoneNumber: '999',
              userBPhoneNumber: '123',
              lastMessage: 'Hi',
              lastMessageTimestamp: '100000',
              lastMessageType: 'sent',
              lastMessageStatus: 'sent',
              unReadCount: 1,
            }),
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          rows: {
            length: 1,
            item: () => ({
              profilePicture: 'pic.png',
              publicKey: 'pubkey',
            }),
          },
        },
      ]);

    (isUserStoredLocally as jest.Mock).mockResolvedValue(true);

    const db = {executeSql: mockExecuteSql};
    const chats = await getAllChatsFromLocal(db as any, '123');

    expect(chats).toEqual([
      {
        chatId: 'chat_123_456',
        contactName: 'Test User',
        contactProfilePic: 'pic.png',
        phoneNumber: '999',
        lastMessageText: 'Hi',
        lastMessageType: 'sentMessage',
        lastMessageStatus: 'sent',
        lastMessageTimestamp: '100000',
        unreadCount: 1,
        publicKey: 'pubkey',
      },
    ]);
  });

  it('should set unreadCount to 0 if sender is current user and chat does not exist', async () => {
    mockExecuteSql
      .mockResolvedValueOnce([{rows: {length: 0, item: () => ({})}}])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{rows: {item: () => ({unreadChats: 0})}}]);

    await upsertChatMetadata('123', '456', 'Hello', '100000', 'sent', true);

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO Chats'),
      expect.arrayContaining([
        'chat_123_456',
        '123',
        '456',
        'Hello',
        '100000',
        'sent',
        'sent',
        0,
      ]),
    );
    expect(store.dispatch).toHaveBeenCalledWith(setUnreadCount(0));
  });

  it('should set unreadCount to 1 if sender is NOT current user and chat does not exist', async () => {
    mockExecuteSql
      .mockResolvedValueOnce([{rows: {length: 0, item: () => ({})}}])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{rows: {item: () => ({unreadChats: 1})}}]);

    await upsertChatMetadata('123', '456', 'Hello', '100000', 'sent', false);

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO Chats'),
      expect.arrayContaining([
        'chat_123_456',
        '123',
        '456',
        'Hello',
        '100000',
        'received',
        'sent',
        1,
      ]),
    );
    expect(store.dispatch).toHaveBeenCalledWith(setUnreadCount(1));
  });
  it('should handle missing userRow in getAllChatsFromLocal', async () => {
    mockExecuteSql
      .mockResolvedValueOnce([
        {
          rows: {
            length: 1,
            item: () => ({
              id: 'chat_123_456',
              userAPhoneNumber: '999',
              userBPhoneNumber: '123',
              lastMessage: 'Hi',
              lastMessageTimestamp: '100000',
              lastMessageType: 'sent',
              lastMessageStatus: 'sent',
              unReadCount: 1,
            }),
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          rows: {
            length: 0,
            item: () => null,
          },
        },
      ]);

    (isUserStoredLocally as jest.Mock).mockResolvedValue(true);

    const db = {executeSql: mockExecuteSql};
    const chats = await getAllChatsFromLocal(db as any, '123');

    expect(chats[0].contactProfilePic).toBeNull();
    expect(chats[0].publicKey).toBeUndefined();
  });
  it('should upsert user info if not stored locally and remoteUser exists', async () => {
    mockExecuteSql
      .mockResolvedValueOnce([
        {
          rows: {
            length: 1,
            item: () => ({
              id: 'chat_123_456',
              userAPhoneNumber: '999',
              userBPhoneNumber: '123',
              lastMessage: 'Hi',
              lastMessageTimestamp: '100000',
              lastMessageType: 'sent',
              lastMessageStatus: 'sent',
              unReadCount: 1,
            }),
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          rows: {
            length: 0,
            item: () => null,
          },
        },
      ]);
    (isUserStoredLocally as jest.Mock).mockResolvedValue(false);
    (getUserByPhoneNumber as jest.Mock).mockResolvedValue({
      profilePicture: 'pic.png',
      publicKey: 'pubkey',
    });

    const db = {executeSql: mockExecuteSql};
    await getAllChatsFromLocal(db as any, '123');

    expect(getUserByPhoneNumber).toHaveBeenCalledWith('999');
    expect(upsertUserInfo as jest.Mock).toHaveBeenCalledWith(db, {
      phoneNumber: '999',
      profilePicture: 'pic.png',
      publicKey: 'pubkey',
    });
  });

  describe('getAllChatsFromLocal lastMessageType mapping', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should map lastMessageType "sent" to "sentMessage"', async () => {
      mockExecuteSql
        .mockResolvedValueOnce([
          {
            rows: {
              length: 1,
              item: () => ({
                id: 'chat_123_456',
                userAPhoneNumber: '999',
                userBPhoneNumber: '123',
                lastMessage: 'Hi',
                lastMessageTimestamp: '100000',
                lastMessageType: 'sent',
                lastMessageStatus: 'sent',
                unReadCount: 1,
              }),
            },
          },
        ])
        .mockResolvedValueOnce([
          {
            rows: {
              length: 1,
              item: () => ({
                profilePicture: 'pic.png',
                publicKey: 'pubkey',
              }),
            },
          },
        ]);

      (isUserStoredLocally as jest.Mock).mockResolvedValue(true);

      const db = {executeSql: mockExecuteSql};
      const chats = await getAllChatsFromLocal(db as any, '123');
      expect(chats[0].lastMessageType).toBe('sentMessage');
    });

    it('should map lastMessageType not "sent" to "receivedMessage"', async () => {
      mockExecuteSql
        .mockResolvedValueOnce([
          {
            rows: {
              length: 1,
              item: () => ({
                id: 'chat_123_456',
                userAPhoneNumber: '999',
                userBPhoneNumber: '123',
                lastMessage: 'Hi',
                lastMessageTimestamp: '100000',
                lastMessageType: 'received',
                lastMessageStatus: 'delivered',
                unReadCount: 1,
              }),
            },
          },
        ])
        .mockResolvedValueOnce([
          {
            rows: {
              length: 1,
              item: () => ({
                profilePicture: 'pic.png',
                publicKey: 'pubkey',
              }),
            },
          },
        ]);

      (isUserStoredLocally as jest.Mock).mockResolvedValue(true);

      const db = {executeSql: mockExecuteSql};
      const chats = await getAllChatsFromLocal(db as any, '123');
      expect(chats[0].lastMessageType).toBe('receivedMessage');
    });

    it('should use userBPhoneNumber as contactPhone when userAPhoneNumber equals currentUserPhone', async () => {
      mockExecuteSql
        .mockResolvedValueOnce([
          {
            rows: {
              length: 1,
              item: () => ({
                id: 'chat_123_456',
                userAPhoneNumber: '123',
                userBPhoneNumber: '999',
                lastMessage: 'Hi',
                lastMessageTimestamp: '100000',
                lastMessageType: 'sent',
                lastMessageStatus: 'sent',
                unReadCount: 1,
              }),
            },
          },
        ])
        .mockResolvedValueOnce([
          {
            rows: {
              length: 1,
              item: () => ({
                profilePicture: 'pic.png',
                publicKey: 'pubkey',
              }),
            },
          },
        ]);

      (isUserStoredLocally as jest.Mock).mockResolvedValue(true);

      const db = {executeSql: mockExecuteSql};
      const chats = await getAllChatsFromLocal(db as any, '123');
      expect(chats[0].phoneNumber).toBe('999');
    });

    it('should use userAPhoneNumber as contactPhone when userAPhoneNumber does not equal currentUserPhone', async () => {
      mockExecuteSql
        .mockResolvedValueOnce([
          {
            rows: {
              length: 1,
              item: () => ({
                id: 'chat_123_456',
                userAPhoneNumber: '999',
                userBPhoneNumber: '123',
                lastMessage: 'Hello',
                lastMessageTimestamp: '200000',
                lastMessageType: 'received',
                lastMessageStatus: 'delivered',
                unReadCount: 2,
              }),
            },
          },
        ])
        .mockResolvedValueOnce([
          {
            rows: {
              length: 1,
              item: () => ({
                profilePicture: 'pic2.png',
                publicKey: 'pubkey2',
              }),
            },
          },
        ]);

      (isUserStoredLocally as jest.Mock).mockResolvedValue(true);

      const db = {executeSql: mockExecuteSql};
      const chats = await getAllChatsFromLocal(db as any, '123');
      expect(chats[0].phoneNumber).toBe('999');
    });
    it('should use currentUnread when chat exists and sender is current user', async () => {
      mockExecuteSql
        .mockResolvedValueOnce([
          {rows: {length: 1, item: () => ({unReadCount: 5})}},
        ])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{rows: {item: () => ({unreadChats: 5})}}]);

      await upsertChatMetadata('123', '456', 'Hello', '100000', 'sent', true);

      expect(mockExecuteSql).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO Chats'),
        expect.arrayContaining([
          'chat_123_456',
          '123',
          '456',
          'Hello',
          '100000',
          'sent',
          'sent',
          5,
        ]),
      );
    });

    it('should use contact name from phoneNameMap if available', async () => {
      mockExecuteSql
        .mockResolvedValueOnce([
          {
            rows: {
              length: 1,
              item: () => ({
                id: 'chat_123_456',
                userAPhoneNumber: '999',
                userBPhoneNumber: '123',
                lastMessage: 'Hi',
                lastMessageTimestamp: '100000',
                lastMessageType: 'sent',
                lastMessageStatus: 'sent',
                unReadCount: 1,
              }),
            },
          },
        ])
        .mockResolvedValueOnce([
          {
            rows: {
              length: 1,
              item: () => ({
                profilePicture: 'pic.png',
                publicKey: 'pubkey',
              }),
            },
          },
        ]);

      const {numberNameIndex} = require('../../helpers/nameNumberIndex');
      numberNameIndex.mockResolvedValue({'999': 'Test User'});

      const {normalise} = require('../../helpers/normalisePhoneNumber');
      normalise.mockImplementation((num: string) => num);

      (isUserStoredLocally as jest.Mock).mockResolvedValue(true);

      const db = {executeSql: mockExecuteSql};
      const chats = await getAllChatsFromLocal(db as any, '123');
      expect(chats[0].contactName).toBe('Test User');
    });
    it('should use contactPhone as contactName if not in phoneNameMap', async () => {
      mockExecuteSql
        .mockResolvedValueOnce([
          {
            rows: {
              length: 1,
              item: () => ({
                id: 'chat_123_456',
                userAPhoneNumber: '888',
                userBPhoneNumber: '123',
                lastMessage: 'Hello',
                lastMessageTimestamp: '200000',
                lastMessageType: 'received',
                lastMessageStatus: 'delivered',
                unReadCount: 2,
              }),
            },
          },
        ])
        .mockResolvedValueOnce([
          {
            rows: {
              length: 1,
              item: () => ({
                profilePicture: 'pic2.png',
                publicKey: 'pubkey2',
              }),
            },
          },
        ]);

      const {numberNameIndex} = require('../../helpers/nameNumberIndex');
      numberNameIndex.mockResolvedValue(null);

      const {normalise} = require('../../helpers/normalisePhoneNumber');
      normalise.mockImplementation((num: string) => num);

      (isUserStoredLocally as jest.Mock).mockResolvedValue(true);

      const db = {executeSql: mockExecuteSql};
      const chats = await getAllChatsFromLocal(db as any, '123');
      expect(chats[0].contactName).toBe('888');
    });
    it('should NOT upsert user info if not stored locally and remoteUser does not exist', async () => {
      mockExecuteSql
        .mockResolvedValueOnce([
          {
            rows: {
              length: 1,
              item: () => ({
                id: 'chat_123_456',
                userAPhoneNumber: '999',
                userBPhoneNumber: '123',
                lastMessage: 'Hi',
                lastMessageTimestamp: '100000',
                lastMessageType: 'sent',
                lastMessageStatus: 'sent',
                unReadCount: 1,
              }),
            },
          },
        ])
        .mockResolvedValueOnce([
          {
            rows: {
              length: 0,
              item: () => null,
            },
          },
        ]);

      (isUserStoredLocally as jest.Mock).mockResolvedValue(false);
      (getUserByPhoneNumber as jest.Mock).mockResolvedValue(null);

      const db = {executeSql: mockExecuteSql};
      await getAllChatsFromLocal(db as any, '123');

      expect(getUserByPhoneNumber).toHaveBeenCalledWith('999');
      expect(upsertUserInfo).not.toHaveBeenCalled();
    });
  });
  describe('upsertChatMetadata unreadCount logic', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (connectionModule.getDBInstance as jest.Mock).mockResolvedValue({
        executeSql: mockExecuteSql,
      });
    });

    it('should set unreadCount to currentUnread when chat exists and sender is current user', async () => {
      mockExecuteSql
        .mockResolvedValueOnce([
          {rows: {length: 1, item: () => ({unReadCount: 5})}},
        ])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{rows: {item: () => ({unreadChats: 5})}}]);

      await upsertChatMetadata('123', '456', 'Hello', '100000', 'sent', true);

      expect(mockExecuteSql).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO Chats'),
        expect.arrayContaining([
          'chat_123_456',
          '123',
          '456',
          'Hello',
          '100000',
          'sent',
          'sent',
          5,
        ]),
      );
    });

    it('should set unreadCount to currentUnread + 1 when chat exists and sender is NOT current user', async () => {
      mockExecuteSql
        .mockResolvedValueOnce([
          {rows: {length: 1, item: () => ({unReadCount: 3})}},
        ])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{rows: {item: () => ({unreadChats: 4})}}]);

      await upsertChatMetadata('123', '456', 'Hello', '100000', 'sent', false);

      expect(mockExecuteSql).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO Chats'),
        expect.arrayContaining([
          'chat_123_456',
          '123',
          '456',
          'Hello',
          '100000',
          'received',
          'sent',
          4,
        ]),
      );
    });

    it('should set unreadCount to 0 when chat does not exist and sender is current user', async () => {
      mockExecuteSql
        .mockResolvedValueOnce([{rows: {length: 0, item: () => ({})}}])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{rows: {item: () => ({unreadChats: 0})}}]);

      await upsertChatMetadata('123', '456', 'Hello', '100000', 'sent', true);

      expect(mockExecuteSql).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO Chats'),
        expect.arrayContaining([
          'chat_123_456',
          '123',
          '456',
          'Hello',
          '100000',
          'sent',
          'sent',
          0,
        ]),
      );
    });

    it('should set unreadCount to 1 when chat does not exist and sender is NOT current user', async () => {
      mockExecuteSql
        .mockResolvedValueOnce([{rows: {length: 0, item: () => ({})}}])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{rows: {item: () => ({unreadChats: 1})}}]);

      await upsertChatMetadata('123', '456', 'Hello', '100000', 'sent', false);

      expect(mockExecuteSql).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO Chats'),
        expect.arrayContaining([
          'chat_123_456',
          '123',
          '456',
          'Hello',
          '100000',
          'received',
          'sent',
          1,
        ]),
      );
    });
    describe('upsertChatMetadata unreadCount logic', () => {
      beforeEach(() => {
        jest.clearAllMocks();
        (connectionModule.getDBInstance as jest.Mock).mockResolvedValue({
          executeSql: mockExecuteSql,
        });
      });

      it('should set unreadCount to currentUnread when chat exists and sender is current user', async () => {
        mockExecuteSql
          .mockResolvedValueOnce([
            {rows: {length: 1, item: () => ({unReadCount: 5})}},
          ])
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([{rows: {item: () => ({unreadChats: 5})}}]);

        await upsertChatMetadata('123', '456', 'Hello', '100000', 'sent', true);

        expect(mockExecuteSql).toHaveBeenCalledWith(
          expect.stringContaining('INSERT OR REPLACE INTO Chats'),
          expect.arrayContaining([
            'chat_123_456',
            '123',
            '456',
            'Hello',
            '100000',
            'sent',
            'sent',
            5,
          ]),
        );
      });

      it('should set unreadCount to currentUnread + 1 when chat exists and sender is NOT current user', async () => {
        mockExecuteSql
          .mockResolvedValueOnce([
            {rows: {length: 1, item: () => ({unReadCount: 3})}},
          ])
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([{rows: {item: () => ({unreadChats: 4})}}]);

        await upsertChatMetadata(
          '123',
          '456',
          'Hello',
          '100000',
          'sent',
          false,
        );

        expect(mockExecuteSql).toHaveBeenCalledWith(
          expect.stringContaining('INSERT OR REPLACE INTO Chats'),
          expect.arrayContaining([
            'chat_123_456',
            '123',
            '456',
            'Hello',
            '100000',
            'received',
            'sent',
            4,
          ]),
        );
      });

      it('should set unreadCount to 0 when chat does not exist and sender is current user', async () => {
        mockExecuteSql
          .mockResolvedValueOnce([{rows: {length: 0, item: () => ({})}}])
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([{rows: {item: () => ({unreadChats: 0})}}]);

        await upsertChatMetadata('123', '456', 'Hello', '100000', 'sent', true);

        expect(mockExecuteSql).toHaveBeenCalledWith(
          expect.stringContaining('INSERT OR REPLACE INTO Chats'),
          expect.arrayContaining([
            'chat_123_456',
            '123',
            '456',
            'Hello',
            '100000',
            'sent',
            'sent',
            0,
          ]),
        );
      });

      it('should set unreadCount to 1 when chat does not exist and sender is NOT current user', async () => {
        mockExecuteSql
          .mockResolvedValueOnce([{rows: {length: 0, item: () => ({})}}])
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([{rows: {item: () => ({unreadChats: 1})}}]);

        await upsertChatMetadata(
          '123',
          '456',
          'Hello',
          '100000',
          'sent',
          false,
        );

        expect(mockExecuteSql).toHaveBeenCalledWith(
          expect.stringContaining('INSERT OR REPLACE INTO Chats'),
          expect.arrayContaining([
            'chat_123_456',
            '123',
            '456',
            'Hello',
            '100000',
            'received',
            'sent',
            1,
          ]),
        );
      });
    });
  });
});
