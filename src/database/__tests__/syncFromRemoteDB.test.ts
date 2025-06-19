import {insertToLocalDB} from '../services/syncFromRemoteDB';
import {getDBInstance} from '../connection/connection';
import {createChatId} from '../../utils/chatId';

jest.mock('../connection/connection');
jest.mock('../../utils/chatId');

const mockExecuteSql = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (getDBInstance as jest.Mock).mockResolvedValue({
    executeSql: mockExecuteSql,
  });
  (createChatId as jest.Mock).mockReturnValue('mock-chat-id');
});

describe('insertToLocalDB (with Messages check)', () => {
  it('inserts all records when Messages are present', async () => {
    const chat = {
      userA: {
        phoneNumber: '111',
        firstName: 'John',
        lastName: 'Doe',
        profilePicture: 'pic.jpg',
        publicKey: 'pubA',
      },
      userB: {
        phoneNumber: '222',
        firstName: 'Jane',
        lastName: 'Smith',
        profilePicture: 'pic2.jpg',
        publicKey: 'pubB',
      },
      Messages: [
        {
          id: 'msg1',
          sender: {phoneNumber: '111'},
          receiver: {phoneNumber: '222'},
          content: 'Hello',
          status: 'sent',
          createdAt: '2023-01-01T00:00:00Z',
        },
      ],
      Conversations: [
        {
          isDeleted: true,
          lastClearedAt: '2023-01-01T00:00:00Z',
        },
      ],
      unreadCount: 2,
    };
    await insertToLocalDB([chat], '111');
    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO Conversations'),
      ['mock-chat-id', '111', 1, '2023-01-01T00:00:00Z'],
    );
  });

  it('skips entire chat if Messages are empty', async () => {
    const chat = {
      userA: {
        phoneNumber: '123',
        firstName: 'Empty',
        lastName: 'Chat',
        profilePicture: '',
        publicKey: '',
      },
      userB: {
        phoneNumber: '456',
        firstName: 'No',
        lastName: 'Message',
        profilePicture: '',
        publicKey: '',
      },
      Messages: [],
      Conversations: [],
    };

    await insertToLocalDB([chat], '123');

    expect(mockExecuteSql).not.toHaveBeenCalled();
  });

  it('handles multiple chats, filters based on Messages presence', async () => {
    const chats = [
      {
        userA: {
          phoneNumber: '1',
          firstName: 'A',
          lastName: 'A',
          profilePicture: '',
          publicKey: '',
        },
        userB: {
          phoneNumber: '2',
          firstName: 'B',
          lastName: 'B',
          profilePicture: '',
          publicKey: '',
        },
        Messages: [],
        Conversations: [],
      },
      {
        userA: {
          phoneNumber: '3',
          firstName: 'C',
          lastName: 'C',
          profilePicture: '',
          publicKey: '',
        },
        userB: {
          phoneNumber: '4',
          firstName: 'D',
          lastName: 'D',
          profilePicture: '',
          publicKey: '',
        },
        Messages: [
          {
            id: 'msg2',
            sender: {phoneNumber: '3'},
            receiver: {phoneNumber: '4'},
            content: 'Hi',
            status: 'delivered',
            createdAt: '2023-01-01T00:00:00Z',
          },
        ],
        Conversations: [
          {isDeleted: false, lastClearedAt: '2022-01-01T00:00:00Z'},
        ],
      },
    ];

    await insertToLocalDB(chats, '3');

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO Messages'),
      [
        'msg2',
        'mock-chat-id',
        '3',
        '4',
        'Hi',
        'delivered',
        '2023-01-01T00:00:00Z',
      ],
    );

    expect(mockExecuteSql).not.toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO Messages'),
      expect.arrayContaining(['1']),
    );
  });
  it('sets lastMessageType as sent if user is sender', async () => {
    const chat = {
      userA: {
        phoneNumber: '111',
        firstName: 'A',
        lastName: 'A',
        profilePicture: '',
        publicKey: '',
      },
      userB: {
        phoneNumber: '222',
        firstName: 'B',
        lastName: 'B',
        profilePicture: '',
        publicKey: '',
      },
      Messages: [
        {
          id: 'msg1',
          sender: {phoneNumber: '111'},
          receiver: {phoneNumber: '222'},
          content: 'Message from self',
          status: 'sent',
          createdAt: '2024-01-02T00:00:00Z',
        },
      ],
      Conversations: [{isDeleted: true, lastClearedAt: '2024-01-01T00:00:00Z'}],
    };

    await insertToLocalDB([chat], '111');

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO Chats'),
      expect.arrayContaining(['sent']),
    );
  });

  it('sets lastMessageType as received if user is receiver', async () => {
    const chat = {
      userA: {
        phoneNumber: '111',
        firstName: 'A',
        lastName: 'A',
        profilePicture: '',
        publicKey: '',
      },
      userB: {
        phoneNumber: '222',
        firstName: 'B',
        lastName: 'B',
        profilePicture: '',
        publicKey: '',
      },
      Messages: [
        {
          id: 'msg1',
          sender: {phoneNumber: '222'},
          receiver: {phoneNumber: '111'},
          content: 'Message from other',
          status: 'delivered',
          createdAt: '2024-01-02T00:00:00Z',
        },
      ],
      Conversations: [
        {isDeleted: false, lastClearedAt: '2024-01-01T00:00:00Z'},
      ],
    };

    await insertToLocalDB([chat], '111');

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO Chats'),
      expect.arrayContaining(['received']),
    );
  });

  it('sets isDeleted = 1 if conversation.isDeleted is true', async () => {
    const chat = {
      userA: {
        phoneNumber: '111',
        firstName: 'A',
        lastName: 'A',
        profilePicture: '',
        publicKey: '',
      },
      userB: {
        phoneNumber: '222',
        firstName: 'B',
        lastName: 'B',
        profilePicture: '',
        publicKey: '',
      },
      Messages: [
        {
          id: 'msg1',
          sender: {phoneNumber: '111'},
          receiver: {phoneNumber: '222'},
          content: 'Hey',
          status: 'read',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ],
      Conversations: [{isDeleted: true, lastClearedAt: '2024-01-01T00:00:00Z'}],
    };

    await insertToLocalDB([chat], '111');

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO Conversations'),
      expect.arrayContaining([
        'mock-chat-id',
        '111',
        1,
        '2024-01-01T00:00:00Z',
      ]),
    );
  });

  it('sets isDeleted = 0 if conversation.isDeleted is false', async () => {
    const chat = {
      userA: {
        phoneNumber: '111',
        firstName: 'A',
        lastName: 'A',
        profilePicture: '',
        publicKey: '',
      },
      userB: {
        phoneNumber: '222',
        firstName: 'B',
        lastName: 'B',
        profilePicture: '',
        publicKey: '',
      },
      Messages: [
        {
          id: 'msg1',
          sender: {phoneNumber: '111'},
          receiver: {phoneNumber: '222'},
          content: 'Hey again',
          status: 'read',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ],
      Conversations: [{isDeleted: false, lastClearedAt: null}],
    };

    await insertToLocalDB([chat], '111');

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO Conversations'),
      expect.arrayContaining(['mock-chat-id', '111', 0, null]),
    );
  });
});
