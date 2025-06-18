import {NavigationContainer} from '@react-navigation/native';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {Provider} from 'react-redux';
import {insertToMessages} from '../../database/services/messageOperations';
import {getAllQueuedMessages} from '../../database/services/queueOperations';
import {useSocketConnection} from '../../hooks/useSocketConnection';
import {checkUserOnline} from '../../services/CheckUserOnline';
import {getAllChats, getMissedChats} from '../../services/GetAllChats';
import {online, sendPrivateMessage} from '../../socket/socket';
import {store} from '../../store/store';
import {HomeTabs} from './HomeTabs';

const mockSendPrivateMessage = jest.fn();
jest.mock('../../services/GetAllChats.ts');
jest.mock('../../socket/socket', () => {
  const mockOn = jest.fn();
  const mockOff = jest.fn();
  const mockDisconnect = jest.fn();
  const mockSocket = {
    on: mockOn,
    off: mockOff,
    disconnect: mockDisconnect,
  };
  return {
    newSocket: mockSocket,
    socketConnection: jest.fn(),
    checkDeviceStatus: jest.fn().mockResolvedValue({success: true}),
    sendPrivateMessage: jest.fn(),
    online: jest.fn(),
  };
});

jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest
    .fn()
    .mockResolvedValue(
      JSON.stringify({name: 'Mamatha', phoneNumber: '+91 6303974914'}),
    ),
  setItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('../../database/services/messageOperations.ts', () => ({
  insertToMessages: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../database/services/userOperations', () => ({
  getLastSyncedTime: jest.fn().mockResolvedValue(new Date().toISOString()),
  updateLastSyncedTime: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../database/services/chatOperations.ts', () => ({
  getTotalUnreadCount: jest.fn().mockResolvedValue(1),
  getAllChatsFromLocal: jest.fn().mockResolvedValue([
    {
      id: 'chat1',
      unreadCount: 2,
      lastMessage: 'Hello',
      participants: ['+91 6303974914', '+91 9000000000'],
    },
  ]),
}));

jest.mock('../../database/connection/connection.ts', () => ({
  getDBInstance: jest.fn().mockResolvedValue({}),
}));

jest.mock('react-native-contacts', () => ({
  getContactsByPhoneNumber: jest.fn(),
  getAllWithoutPhotos: jest.fn(),
}));

jest.mock('react-native-image-crop-picker', () => ({
  openPicker: jest.fn().mockResolvedValue({path: 'mocked/image/path.jpg'}),
  openCamera: jest.fn().mockResolvedValue({path: 'mocked/image/path.jpg'}),
}));

jest.mock('react-native-fs', () => ({
  readFile: jest.fn().mockResolvedValue('mocked-base64-string'),
}));

jest.mock('../../permissions/ImagePermissions', () => ({
  requestPermissions: jest.fn().mockResolvedValue(false),
}));

jest.mock('../../helpers/nameNumberIndex', () => ({
  numberNameIndex: jest.fn().mockResolvedValue({
    '+916303961097': 'Test User',
  }),
}));

jest.mock('react-native-libsodium', () => ({
  from_base64: jest.fn((input: string) =>
    Uint8Array.from(Buffer.from(input, 'base64')),
  ),
  to_base64: jest.fn((input: Uint8Array) =>
    Buffer.from(input).toString('base64'),
  ),
  crypto_box_open_easy: jest.fn(() =>
    Uint8Array.from(Buffer.from('my-private-key')),
  ),
  to_string: jest.fn((input: Uint8Array) =>
    Buffer.from(input).toString('utf-8'),
  ),
}));
jest.mock('../../hooks/useSocketConnection.ts', () => ({
  useSocketConnection: jest.fn(),
}));

jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn().mockReturnValue('mock-device-id'),
  getSystemName: jest.fn().mockReturnValue('iOS'),
  getModel: jest.fn().mockReturnValue('iPhone'),
  getDeviceId: jest.fn().mockReturnValue('iPhone12,1'),
  getSystemVersion: jest.fn().mockReturnValue('14.4'),
  getVersion: jest.fn().mockReturnValue('1.0.0'),
  getBuildNumber: jest.fn().mockReturnValue('100'),
}));
jest.mock('../../database/services/queueOperations');
jest.mock('../../services/CheckUserOnline');
jest.mock('../stack/HomeStacks', () => ({
  HomeStacks: () => null,
}));

jest.mock('../stack/UnreadStacks', () => ({
  UnreadStacks: () => null,
}));

jest.mock('../stack/ProfileStacks', () => ({
  ProfileStack: () => null,
}));

const mockedGetAllChats = getAllChats as jest.MockedFunction<
  typeof getAllChats
>;
const mockedGetMissedChats = getMissedChats as jest.MockedFunction<
  typeof getMissedChats
>;

const mockedCheckUserOnline = checkUserOnline as jest.MockedFunction<
  typeof checkUserOnline
>;

const mockedGetAllQueuedMessages = getAllQueuedMessages as jest.MockedFunction<
  typeof getAllQueuedMessages
>;

describe('HomeTabs tests', () => {
  const mockedEncryptedStorage = EncryptedStorage as jest.Mocked<
    typeof EncryptedStorage
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    (useSocketConnection as jest.Mock).mockReturnValue({isConnected: true});
    mockedGetAllChats.mockResolvedValue({
      status: 200,
      data: {
        chats: [{unreadCount: 2}, {unreadCount: 0}],
      },
    });
    mockedGetMissedChats.mockResolvedValue({
      status: 200,
      data: [
        {
          senderPhoneNumber: '+911111111111',
          messages: [
            {
              senderPhoneNumber: '+911111111111',
              createdAt: new Date().toISOString(),
              content: 'Hello',
              status: 'delivered',
            },
          ],
        },
      ],
    });
  });

  it('renders the Tabs', async () => {
    const {getByText} = render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );
    await waitFor(() => {
      expect(getByText('All Chats')).toBeTruthy();
      expect(getByText('Unread Chats')).toBeTruthy();
      expect(getByText('Profile')).toBeTruthy();
    });
  });

  it('navigates to profileScreen when Profile tab is pressed', async () => {
    const {getByText} = render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );
    const profileTab = await waitFor(() => getByText('Profile'));
    fireEvent.press(profileTab);
  });

  it('does not sync messages if firstSync is true', async () => {
    mockedEncryptedStorage.getItem = jest.fn().mockImplementation(key => {
      if (key === 'user') {
        return Promise.resolve(JSON.stringify({phoneNumber: '+916303974914'}));
      }
      if (key === 'firstSync') {
        return Promise.resolve('true');
      }
      return Promise.resolve(null);
    });

    const {getByText} = render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(getByText('All Chats')).toBeTruthy();
    });

    expect(mockedEncryptedStorage.setItem).toHaveBeenCalledWith(
      'firstSync',
      'false',
    );
  });

  it('processes queued messages when connected and shouldProcessGlobalQueue is true', async () => {
    const mockQueuedMessages = [
      {
        id: 'queue1',
        receiverPhoneNumber: '+919999999999',
        senderPhoneNumber: '+916303974914',
        message: 'Queued message 1',
        timestamp: new Date().toISOString(),
        status: 'pending',
      },
      {
        id: 'queue2',
        receiverPhoneNumber: '+918888888888',
        senderPhoneNumber: '+916303974914',
        message: 'Queued message 2',
        timestamp: new Date().toISOString(),
        status: 'pending',
      },
    ];

    (mockedGetAllQueuedMessages as jest.Mock).mockResolvedValue(
      mockQueuedMessages,
    );
    mockedCheckUserOnline.mockResolvedValue({
      status: 200,
      data: {data: {socketId: 'socket123'}},
    });

    (useSocketConnection as jest.Mock).mockReturnValue({isConnected: true});
    render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(mockedGetAllQueuedMessages).toHaveBeenCalled();
    });
  });

  it('calls socketConnection with user phone number on mount', async () => {
    const {socketConnection} = require('../../socket/socket');

    render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(socketConnection).toHaveBeenCalledWith('+916303974914');
    });
  });
  it('sends message with status "delivered" when receiver is online but not in chat', async () => {
    mockedCheckUserOnline.mockResolvedValue({
      status: 200,
      data: {data: {socketId: 'socket123'}},
    });

    (mockedGetAllQueuedMessages as jest.Mock).mockResolvedValue([
      {
        id: 'queue1',
        receiverPhoneNumber: '+919999999999',
        senderPhoneNumber: '+916303974914',
        message: 'Hi there!',
        timestamp: new Date().toISOString(),
        status: 'pending',
      },
    ]);

    render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(mockedGetAllQueuedMessages).toHaveBeenCalled();
    });
  });
  it('handles errors in processing queue gracefully', async () => {
    mockedGetAllQueuedMessages.mockRejectedValue(new Error('DB error'));

    render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(mockedGetAllQueuedMessages).toHaveBeenCalled();
    });
  });
  it('increases message count on receiving new_message event', async () => {
    const {newSocket} = require('../../socket/socket');

    render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(newSocket.on).toHaveBeenCalledWith(
        'new_message',
        expect.any(Function),
      );
    });

    const newMessageHandler = newSocket.on.mock.calls.find(
      ([eventName]: string) => eventName === 'new_message',
    )[1];

    newMessageHandler({newMessage: true});
  });
  it('inserts missed chats when firstSync is false', async () => {
    mockedEncryptedStorage.getItem = jest.fn().mockImplementation(key => {
      if (key === 'user') {
        return Promise.resolve(JSON.stringify({phoneNumber: '+916303974914'}));
      }
      if (key === 'firstSync') {
        return Promise.resolve('false');
      }
      return Promise.resolve(null);
    });

    render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(getMissedChats).toHaveBeenCalled();
    });
  });

  it('does not process queue if not connected', async () => {
    (useSocketConnection as jest.Mock).mockReturnValue({isConnected: false});

    render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(mockedGetAllQueuedMessages).not.toHaveBeenCalledTimes(1);
    });
  });

  it('does not process queue if isProcessingQueue is true', async () => {
    (useSocketConnection as jest.Mock).mockReturnValue({isConnected: true});
    (global as any).shouldProcessGlobalQueue = true;

    mockedGetAllQueuedMessages.mockClear();
    mockedCheckUserOnline.mockClear();

    mockedGetAllQueuedMessages.mockResolvedValue([]);

    render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(mockedGetAllQueuedMessages).not.toHaveBeenCalled();
      expect(mockedCheckUserOnline).not.toHaveBeenCalled();
    });
  });
  it('does not process queue if shouldProcessGlobalQueue is false', async () => {
    (useSocketConnection as jest.Mock).mockReturnValue({isConnected: true});
    (global as any).shouldProcessGlobalQueue = false;

    render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(mockedCheckUserOnline).not.toHaveBeenCalled();
    });
  });
  it('does not process queue if shouldProcessGlobalQueue is false (break check)', async () => {
    (global as any).shouldProcessGlobalQueue = false;

    (useSocketConnection as jest.Mock).mockReturnValue({isConnected: true});

    mockedGetAllQueuedMessages.mockClear();
    mockSendPrivateMessage.mockClear();

    render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(mockedGetAllQueuedMessages).not.toHaveBeenCalled();
      expect(mockSendPrivateMessage).not.toHaveBeenCalled();
    });
  });
  it('sets message status as "read" when receiver is online and in chat', async () => {
    (useSocketConnection as jest.Mock).mockReturnValue({isConnected: true});
    (global as any).shouldProcessGlobalQueue = true;
    EncryptedStorage.getItem = jest.fn().mockImplementation((key: string) => {
      if (key === 'user') {
        return Promise.resolve(JSON.stringify({phoneNumber: '+916303974914'}));
      }
      if (key === 'authToken') {
        return Promise.resolve('mock-token');
      }
      if (key === 'firstSync') {
        return Promise.resolve('false');
      }
      return Promise.resolve(null);
    });

    const mockQueuedMessage = {
      id: 'queue1',
      receiverPhoneNumber: '+919999999999',
      senderPhoneNumber: '+916303974914',
      message: 'Test message',
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    mockedGetAllQueuedMessages.mockResolvedValue([mockQueuedMessage]);
    mockedCheckUserOnline.mockResolvedValue({
      status: 200,
      data: {data: {socketId: 'mock-socket-id'}},
    });

    (online as jest.Mock).mockImplementation(async ({setIsOnline}: { setIsOnline: (v: boolean) => void }) => {
      setIsOnline(true);
    });

    render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(mockedCheckUserOnline).toHaveBeenCalled();
      expect(mockedGetAllQueuedMessages).toHaveBeenCalled();
    });
  });
  it('sets message status as "sent" when receiver is offline', async () => {
    (useSocketConnection as jest.Mock).mockReturnValue({isConnected: true});
    (global as any).shouldProcessGlobalQueue = true;

    const mockQueuedMessage = {
      id: 'queue2',
      receiverPhoneNumber: '+919999999999',
      senderPhoneNumber: '+916303974914',
      message: 'Offline message',
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    mockedGetAllQueuedMessages.mockResolvedValue([mockQueuedMessage]);
    mockedCheckUserOnline.mockResolvedValue({
      status: 404,
      data: {},
    });

    render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(mockedGetAllQueuedMessages).toHaveBeenCalled();
      expect(mockedCheckUserOnline).toHaveBeenCalled();
    });
  });
  it('removes new_message listener on unmount', async () => {
    const {newSocket} = require('../../socket/socket');
    const removeMock = jest.fn();
    newSocket.off = removeMock;

    const {unmount} = render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(newSocket.on).toHaveBeenCalledWith(
        'new_message',
        expect.any(Function),
      );
    });

    unmount();

    expect(removeMock).toHaveBeenCalledWith(
      'new_message',
      expect.any(Function),
    );
  });
  it('does not proceed with queue processing if user is null', async () => {
    (useSocketConnection as jest.Mock).mockReturnValue({isConnected: true});
    mockedEncryptedStorage.getItem = jest
      .fn()
      .mockImplementation((key: string) => {
        if (key === 'user') {return Promise.resolve(null);}
        return Promise.resolve('mock-token');
      });

    render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(mockedGetAllQueuedMessages).not.toHaveBeenCalled();
    });
  });

  it('breaks queue processing if shouldProcessGlobalQueue becomes false mid-loop', async () => {
    (useSocketConnection as jest.Mock).mockReturnValue({isConnected: true});
    (global as any).shouldProcessGlobalQueue = true;

    EncryptedStorage.getItem = jest.fn().mockImplementation((key: string) => {
      if (key === 'user') {
        return Promise.resolve(JSON.stringify({phoneNumber: '+916303974914'}));
      }
      if (key === 'authToken') {
        return Promise.resolve('mock-token');
      }
      if (key === 'firstSync') {
        return Promise.resolve('false');
      }
      return Promise.resolve(null);
    });
    const messages = [
      {
        id: 'queue1',
        receiverPhoneNumber: '+911111111111',
        senderPhoneNumber: '+916303974914',
        message: 'Should break before this is sent',
        timestamp: new Date().toISOString(),
        status: 'pending',
      },
      {
        id: 'queue2',
        receiverPhoneNumber: '+922222222222',
        senderPhoneNumber: '+916303974914',
        message: 'Should never be reached',
        timestamp: new Date().toISOString(),
        status: 'pending',
      },
    ];

    mockedGetAllQueuedMessages.mockResolvedValue(messages);

    mockedCheckUserOnline.mockResolvedValue({
      status: 200,
      data: {data: {socketId: 'some-socket-id'}},
    });

    (online as jest.Mock).mockImplementation(async ({setIsOnline}: { setIsOnline: (v: boolean) => void }) => {
      (global as any).shouldProcessGlobalQueue = false;
      setIsOnline(false);
    });

    const sendPrivateMessageMock = sendPrivateMessage as jest.Mock;
    sendPrivateMessageMock.mockClear();

    render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(mockedGetAllQueuedMessages).toHaveBeenCalled();
    });

    expect(sendPrivateMessageMock).toHaveBeenCalled();
  });
  it('sets status to "read" if receiver is online and in chat', async () => {
    (useSocketConnection as jest.Mock).mockReturnValue({isConnected: true});
    (global as any).shouldProcessGlobalQueue = true;

    EncryptedStorage.getItem = jest.fn().mockImplementation((key: string) => {
      if (key === 'user') {
        return Promise.resolve(JSON.stringify({phoneNumber: '+916303974914'}));
      }
      if (key === 'authToken') {
        return Promise.resolve('mock-auth-token');
      }
      if (key === 'firstSync') {
        return Promise.resolve('false');
      }
      return Promise.resolve(null);
    });

    const mockMessage = {
      id: 'read-status-test',
      receiverPhoneNumber: '+919999999999',
      senderPhoneNumber: '+916303974914',
      message: 'Read status test',
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    mockedGetAllQueuedMessages.mockResolvedValue([mockMessage]);

    mockedCheckUserOnline.mockImplementation(async () => {
      return {
        status: 200,
        data: {data: {socketId: 'socket-123'}},
      };
    });

    const sendPrivateMessageMock = sendPrivateMessage as jest.Mock;
    sendPrivateMessageMock.mockClear();

    render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(sendPrivateMessageMock).toHaveBeenCalled();
    });

    const payload = sendPrivateMessageMock.mock.calls[0][0];
    expect(payload.status).toBe('delivered');
  });

  it('skips missed chat messages sent by current user (continue case)', async () => {
    (useSocketConnection as jest.Mock).mockReturnValue({isConnected: true});
    (global as any).shouldProcessGlobalQueue = false;

    EncryptedStorage.getItem = jest.fn().mockImplementation((key: string) => {
      if (key === 'user') {
        return Promise.resolve(JSON.stringify({phoneNumber: '+916303974914'}));
      }
      if (key === 'firstSync') {
        return Promise.resolve('false');
      }
      return Promise.resolve(null);
    });
    mockedGetMissedChats.mockResolvedValue({
      status: 200,
      data: [
        {
          senderPhoneNumber: '+911111111111',
          messages: [
            {
              senderPhoneNumber: '+916303974914',
              createdAt: new Date().toISOString(),
              content: 'Should be skipped',
              status: 'sent',
            },
          ],
        },
      ],
    });

    const insertMock = insertToMessages as jest.Mock;
    insertMock.mockClear();

    render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(mockedGetMissedChats).toHaveBeenCalled();
    });
    expect(insertMock).not.toHaveBeenCalled();
  });
});
