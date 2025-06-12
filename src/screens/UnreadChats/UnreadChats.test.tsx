import { NavigationContainer } from '@react-navigation/native';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { numberNameIndex } from '../../helpers/nameNumberIndex';
import { getAllChats } from '../../services/GetAllChats';
import { incrementTrigger } from '../../store/slices/chatSlice';
import { store } from '../../store/store';
import { Chat, UnreadChats } from './UnreadChats';

const mockChats = [
  {
    chatId: '1',
    contactName: 'User A',
    contactProfilePic: null,
    lastMessageStatus: 'delivered',
    lastMessageText: 'How are you doing?',
    lastMessageTimestamp: '2025-04-10T11:30:00Z',
    lastMessageType: 'ReceivedMessage',
    phoneNumber: '8978363862',
    unreadCount: 3,
    publicKey: '',
  },
];

const emptyChats: Chat[] = [];

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
  getItem: jest.fn().mockResolvedValue('mock-private-key'),
}));

jest.mock('../../services/MessageDecryption', () => ({
  messageDecryption: jest.fn().mockResolvedValue('Decrypted Message'),
}));

jest.mock('../../services/MessageDecryption', () => ({
  messageDecryption: jest.fn().mockImplementation(({encryptedMessage}) => {
    if (encryptedMessage === 'Hello there!') {
      return '✓Hello there!';
    }
    if (encryptedMessage === 'How are you doing?') {
      return '✓✓How are you doing?';
    }
    return encryptedMessage;
  }),
}));

jest.useFakeTimers();

jest.mock('../../helpers/nameNumberIndex', () => ({
  numberNameIndex: jest.fn(),
}));

jest.mock('../../services/GetAllChats', () => ({
  getAllChats: jest.fn(),
}));

jest.mock('../../helpers/normalisePhoneNumber', () => ({
  normalise: jest.fn(),
}));

jest.mock('../../store/slices/chatSlice', () => ({
  incrementTrigger: jest.fn(() => ({type: 'INCREMENT_TRIGGER'})),
}));

describe('Unread chats component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-04-24T12:00:00').getTime());
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should logout and redirect if numberNameIndex returns null', async () => {
    (numberNameIndex as jest.Mock).mockResolvedValue(null);

    await waitFor(() => {
      render(
        <Provider store={store}>
          <NavigationContainer>
            <UnreadChats />
          </NavigationContainer>
        </Provider>,
      );
    });

    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertType).toBe('error');
      expect(state.registration.alertMessage).toBe('Please login again.');
      jest.advanceTimersByTime(1000);
      expect(mockReplace).toHaveBeenCalledWith('login');
    });
  });

  it('should logout and redirect to login on 401 response', async () => {
    (numberNameIndex as jest.Mock).mockResolvedValue({});
    (getAllChats as jest.Mock).mockResolvedValue({status: 401});

    await waitFor(() => {
      render(
        <Provider store={store}>
          <NavigationContainer>
            <UnreadChats />
          </NavigationContainer>
        </Provider>,
      );
    });

    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertType).toBe('error');
      expect(state.registration.alertMessage).toBe('Please login again.');
      jest.advanceTimersByTime(1000);
      expect(mockReplace).toHaveBeenCalledWith('login');
    });
  });

  it('should render text when no chats count is less than zero', async () => {
    (numberNameIndex as jest.Mock).mockResolvedValue({});
    (getAllChats as jest.Mock).mockResolvedValue({
      status: 200,
      data: {chats: emptyChats},
    });

    await waitFor(() => {
      render(
        <Provider store={store}>
          <NavigationContainer>
            <UnreadChats />
          </NavigationContainer>
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText('EmptyUnreadMessage')).toBeTruthy();
    });
  });

  it('should render unread chats with correct information', async () => {
    (numberNameIndex as jest.Mock).mockResolvedValue({});

    (getAllChats as jest.Mock).mockResolvedValue({
      status: 200,
      data: {chats: mockChats},
    });

    await waitFor(() => {
      render(
        <Provider store={store}>
          <NavigationContainer>
            <UnreadChats />
          </NavigationContainer>
        </Provider>,
      );
    });

    await waitFor(() => {
      const profileImage = screen.getAllByAccessibilityHint('profile-image');
      expect(profileImage.length).toBe(1);
      expect(screen.getByText('8978363862')).toBeTruthy();
      expect(screen.getByText('Apr 10, 2025')).toBeTruthy();
      expect(screen.getByText('3')).toBeTruthy();
      expect(screen.getByText(/How are you doing\?/)).toBeTruthy();
    });
  });

  it('should navigate to individual chat when chatbox is pressed', async () => {
    (numberNameIndex as jest.Mock).mockResolvedValue({});

    (getAllChats as jest.Mock).mockResolvedValue({
      status: 200,
      data: {chats: mockChats},
    });

    await waitFor(() => {
      render(
        <Provider store={store}>
          <NavigationContainer>
            <UnreadChats />
          </NavigationContainer>
        </Provider>,
      );
    });
    await waitFor(() => {
      expect(screen.getByText('8978363862')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('8978363862'));

    expect(mockNavigate).toHaveBeenCalledWith('individualChat', {
      user: {
        name: '8978363862',
        profilePicture: null,
        phoneNumber: '8978363862',
        isBlocked: false,
        publicKey: '',
        onBlockStatusChange: expect.any(Function),
      },
    });
  });

  it('should not set chats if response status is not 200', async () => {
    (numberNameIndex as jest.Mock).mockResolvedValue({});
    (getAllChats as jest.Mock).mockResolvedValue({
      status: 500,
      data: { chats: mockChats },
    });

    await waitFor(() => {
      render(
        <Provider store={store}>
          <NavigationContainer>
            <UnreadChats />
          </NavigationContainer>
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText('EmptyUnreadMessage')).toBeTruthy();
    });
  });

  it('should dispatch incrementTrigger after fetching unread chats', async () => {
    jest.spyOn(store, 'dispatch').mockImplementation(jest.fn());

    (numberNameIndex as jest.Mock).mockResolvedValue({});
    (getAllChats as jest.Mock).mockResolvedValue({
      status: 200,
      data: {
        chats: [
          {
            chatId: '1',
            contactName: 'User A',
            contactProfilePic: null,
            lastMessageStatus: 'delivered',
            lastMessageText: 'How are you doing?',
            lastMessageTimestamp: '2025-04-10T11:30:00Z',
            lastMessageType: 'receivedMessage',
            phoneNumber: '8978363862',
            unreadCount: 3,
            publicKey: '',
          },
        ],
      },
    });

      render(
        <Provider store={store}>
          <NavigationContainer>
            <UnreadChats />
          </NavigationContainer>
        </Provider>,
      );

    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(incrementTrigger());
    });
  });
});
