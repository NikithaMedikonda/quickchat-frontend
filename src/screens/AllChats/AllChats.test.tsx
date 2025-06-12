import {NavigationContainer} from '@react-navigation/native';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {Provider} from 'react-redux';
import {newSocket} from '../../socket/socket';
import {store} from '../../store/store';
import {AllChats, Chat} from './AllChats';
import {
  getAllChatsFromLocal,
  getTotalUnreadCount,
} from '../../database/services/chatOperations';
import {getDBInstance} from '../../database/connection/connection';
import {messageDecryption} from '../../services/MessageDecryption';

const mockChats = [
  {
    chatId: '1',
    contactName: 'User A',
    contactProfilePic: null,
    lastMessageStatus: 'sent',
    lastMessageText: 'Hello there!',
    lastMessageTimestamp: '2025-05-25T12:00:00Z',
    lastMessageType: 'sentMessage',
    phoneNumber: '+1234567890',
    unreadCount: 3,
    publicKey: 'publicKey1',
  },
  {
    chatId: '2',
    contactName: 'User B',
    contactProfilePic: null,
    lastMessageStatus: 'delivered',
    lastMessageText: 'How are you doing?',
    lastMessageTimestamp: '2025-05-24T11:30:00Z',
    lastMessageType: 'sentMessage',
    phoneNumber: '+1234567999',
    unreadCount: 0,
    publicKey: 'publicKey2',
  },
];

const mockChatsWithReceivedMessage = [
  {
    chatId: '3',
    contactName: 'User C',
    contactProfilePic: 'profile.jpg',
    lastMessageStatus: 'delivered',
    lastMessageText: 'Received message',
    lastMessageTimestamp: '2025-05-23T10:00:00Z',
    lastMessageType: 'receivedMessage',
    phoneNumber: '+1234567888',
    unreadCount: 1,
    publicKey: 'publicKey3',
  },
];

interface EmptyChat extends Partial<Chat> {}

const emptyChats: EmptyChat[] = [];

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockSetOptions = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      replace: mockReplace,
      setOptions: mockSetOptions,
    }),
  };
});

jest.mock('react-native-encrypted-storage', () => ({
  clear: jest.fn(),
  getItem: jest.fn(),
}));

jest.mock('../../services/MessageDecryption', () => ({
  messageDecryption: jest.fn(),
}));

jest.mock('../../database/services/chatOperations', () => ({
  getAllChatsFromLocal: jest.fn(),
  getTotalUnreadCount: jest.fn(),
}));

jest.mock('../../database/connection/connection', () => ({
  getDBInstance: jest.fn(),
}));

jest.mock('../../services/useDeviceCheck', () => ({
  useDeviceCheck: jest.fn(),
}));

jest.useFakeTimers();

const mockOn = jest.fn();
const mockDb = {
  executeSql: jest.fn(),
};

newSocket.on = mockOn;

describe('AllChats Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(key => {
      if (key === 'user') {
        return Promise.resolve(JSON.stringify({phoneNumber: '1234567890'}));
      }
      if (key === 'privateKey') {
        return Promise.resolve('privateKey');
      }
      return Promise.resolve(null);
    });
    (getDBInstance as jest.Mock).mockResolvedValue(mockDb);
    (getTotalUnreadCount as jest.Mock).mockResolvedValue(0);
    (messageDecryption as jest.Mock).mockImplementation(
      ({encryptedMessage}) => {
        return Promise.resolve(encryptedMessage);
      },
    );
  });

  it('should display header title correctly', async () => {
    (getAllChatsFromLocal as jest.Mock).mockResolvedValue([]);

    render(
      <Provider store={store}>
        <NavigationContainer>
          <AllChats />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          headerTitle: 'Quick Chat',
          headerTitleAlign: 'center',
        }),
      );
    });
  });

  it('should render Home component when no chats are available', async () => {
    (getAllChatsFromLocal as jest.Mock).mockResolvedValue(emptyChats);

    render(
      <Provider store={store}>
        <NavigationContainer>
          <AllChats />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      // expect(
      //   screen.getByText('Start messages text'),
      // ).toBeTruthy();
      expect(screen.getByText('User friendly question')).toBeTruthy();
    });
  });

  it('should render all chats with correct information', async () => {
    (getAllChatsFromLocal as jest.Mock).mockResolvedValue(mockChats);
    (messageDecryption as jest.Mock).mockImplementation(
      ({encryptedMessage}) => {
        return Promise.resolve(encryptedMessage);
      },
    );

    render(
      <Provider store={store}>
        <NavigationContainer>
          <AllChats />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('User A')).toBeTruthy();
      expect(screen.getByText('User B')).toBeTruthy();
      expect(screen.getByText('Hello there!')).toBeTruthy();
      expect(screen.getByText('How are you doing?')).toBeTruthy();
    });
  });

  it('should navigate to individual chat when chatbox is pressed', async () => {
    (getAllChatsFromLocal as jest.Mock).mockResolvedValue(mockChats);

    render(
      <Provider store={store}>
        <NavigationContainer>
          <AllChats />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('User A')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('User A'));

    expect(mockNavigate).toHaveBeenCalledWith('individualChat', {
      user: {
        name: 'User A',
        profilePicture: null,
        phoneNumber: '+1234567890',
        isBlocked: false,
        publicKey: 'publicKey1',
        onBlockStatusChange: expect.any(Function),
      },
    });
  });

  it('should render plus icon for adding new chats', async () => {
    (getAllChatsFromLocal as jest.Mock).mockResolvedValue([]);

    render(
      <Provider store={store}>
        <NavigationContainer>
          <AllChats />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByAccessibilityHint('plus-image')).toBeTruthy();
    });
  });

  it('should navigate to contacts when plus icon is pressed', async () => {
    (getAllChatsFromLocal as jest.Mock).mockResolvedValue([]);

    render(
      <Provider store={store}>
        <NavigationContainer>
          <AllChats />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      const plusIcon = screen.getByAccessibilityHint('plus-image');
      fireEvent.press(plusIcon);
      expect(mockNavigate).toHaveBeenCalledWith('contacts');
    });
  });

  it('should increment updateStatusCount when data.isOnline is true', async () => {
    (getAllChatsFromLocal as jest.Mock).mockResolvedValue([]);

    render(
      <Provider store={store}>
        <NavigationContainer>
          <AllChats />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith('user');
    });

    const socketCalls = mockOn.mock.calls;
    const isOnlineCall = socketCalls.find(call =>
      call[0].includes('isOnline_with_'),
    );

    expect(isOnlineCall).toBeTruthy();

    const initialGetAllChatsCallCount = (getAllChatsFromLocal as jest.Mock).mock
      .calls.length;

    const registeredHandler = isOnlineCall[1];
    registeredHandler({isOnline: true});

    await waitFor(() => {
      const finalCallCount = (getAllChatsFromLocal as jest.Mock).mock.calls
        .length;
      expect(finalCallCount).toBeGreaterThan(initialGetAllChatsCallCount);
    });
  });

  it('should dispatch hide action when messageDecryption throws an error', async () => {
    const mockChatsWithError = [
      {
        chatId: '1',
        contactName: 'User A',
        contactProfilePic: null,
        lastMessageStatus: 'sent',
        lastMessageText: 'Hello there!',
        lastMessageTimestamp: '2025-05-25T12:00:00Z',
        lastMessageType: 'sentMessage',
        phoneNumber: '+1234567890',
        unreadCount: 3,
        publicKey: 'publicKey1',
      },
    ];

    (getAllChatsFromLocal as jest.Mock).mockResolvedValue(mockChatsWithError);
    (messageDecryption as jest.Mock).mockRejectedValue(
      new Error('Decryption failed'),
    );

    const dispatchSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <NavigationContainer>
          <AllChats />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(messageDecryption).toHaveBeenCalled();
    });

    await waitFor(() => {
      // expect(
      //   screen.getByText('Start messages text'),
      // ).toBeTruthy();
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'loading/hide',
        }),
      );
    });

    dispatchSpy.mockRestore();
  });

  it('should handle case when user exists but privateKey does not exist', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(key => {
      if (key === 'user') {
        return Promise.resolve(JSON.stringify({phoneNumber: '1234567890'}));
      }
      if (key === 'privateKey') {
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    });

    (getAllChatsFromLocal as jest.Mock).mockResolvedValue(mockChats);

    render(
      <Provider store={store}>
        <NavigationContainer>
          <AllChats />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('User A')).toBeTruthy();
      expect(screen.getByText('User B')).toBeTruthy();
    });

    expect(messageDecryption).not.toHaveBeenCalled();
  });

  it('should handle chat with receivedMessage type (no status)', async () => {
    (getAllChatsFromLocal as jest.Mock).mockResolvedValue(
      mockChatsWithReceivedMessage,
    );

    render(
      <Provider store={store}>
        <NavigationContainer>
          <AllChats />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('User C')).toBeTruthy();
      expect(screen.getByText('Received message')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('User C'));

    expect(mockNavigate).toHaveBeenCalledWith('individualChat', {
      user: {
        name: 'User C',
        profilePicture: 'profile.jpg',
        phoneNumber: '+1234567888',
        isBlocked: false,
        publicKey: 'publicKey3',
        onBlockStatusChange: expect.any(Function),
      },
    });
  });

  it('should handle socket event when data.isOnline is false', async () => {
    (getAllChatsFromLocal as jest.Mock).mockResolvedValue([]);

    render(
      <Provider store={store}>
        <NavigationContainer>
          <AllChats />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith('user');
    });

    const initialGetAllChatsCallCount = (getAllChatsFromLocal as jest.Mock).mock
      .calls.length;
    const socketCalls = mockOn.mock.calls;
    const isOnlineCall = socketCalls.find(call =>
      call[0].includes('isOnline_with_'),
    );

    expect(isOnlineCall).toBeTruthy();

    const registeredHandler = isOnlineCall[1];
    registeredHandler({isOnline: false});
    jest.advanceTimersByTime(100);
    const finalCallCount = (getAllChatsFromLocal as jest.Mock).mock.calls
      .length;
    expect(finalCallCount).toBe(initialGetAllChatsCallCount);
  });
});
