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
import { store } from '../../store/store';
import { AllChats, Chat } from './AllChats';

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
    isBlocked: false,
    onBlockStatusChange: jest.fn(),
    publicKey: '',
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
    isBlocked: false,
    onBlockStatusChange: jest.fn(),
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

jest.mock('../../services/useDeviceCheck', () => ({
  useDeviceCheck: jest.fn(),
}));
jest.mock('../../services/GetAllChats', () => ({
  getAllChats: jest.fn(),
}));

jest.mock('../../helpers/normalisePhoneNumber', () => ({
  normalise: jest.fn(),
}));

describe('AllChats Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display header title correctly', async () => {
    (numberNameIndex as jest.Mock).mockResolvedValue({});
    (getAllChats as jest.Mock).mockResolvedValue({
      status: 200,
      data: {chats: []},
    });

    await waitFor(() => {
      render(
        <Provider store={store}>
          <NavigationContainer>
            <AllChats />
          </NavigationContainer>
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          headerTitle: 'Quick Chat',
          headerTitleAlign: 'center',
        }),
      );
    });
  });

  it('should logout and redirect if numberNameIndex returns null', async () => {
    (numberNameIndex as jest.Mock).mockResolvedValue(null);

    await waitFor(() => {
      render(
        <Provider store={store}>
          <NavigationContainer>
            <AllChats />
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
            <AllChats />
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

  it('should render Home component when no chats are available', async () => {
    (numberNameIndex as jest.Mock).mockResolvedValue({});
    (getAllChats as jest.Mock).mockResolvedValue({
      status: 200,
      data: {chats: emptyChats},
    });

    await waitFor(() => {
      render(
        <Provider store={store}>
          <NavigationContainer>
            <AllChats />
          </NavigationContainer>
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText('One message. Infinite possibilities.'),
      ).toBeTruthy();
      expect(screen.getByText('What are you waiting for?')).toBeTruthy();
    });
  });

  it('should render all chats with correct information', async () => {
    (numberNameIndex as jest.Mock).mockResolvedValue({});

    (getAllChats as jest.Mock).mockResolvedValue({
      status: 200,
      data: {chats: mockChats},
    });

    await waitFor(() => {
      render(
        <Provider store={store}>
          <NavigationContainer>
            <AllChats />
          </NavigationContainer>
        </Provider>,
      );
    });

    await waitFor(() => {
      const profileImage = screen.getAllByAccessibilityHint('profile-image');
      expect(profileImage.length).toBe(2);
      expect(screen.getByText('+1234567890')).toBeTruthy();
      expect(screen.getByText('May 25, 2025')).toBeTruthy();
      expect(screen.getByText('3')).toBeTruthy();
      expect(screen.getByText('+1234567999')).toBeTruthy();
      expect(screen.getByText(/How are you doing\?/)).toBeTruthy();

      expect(screen.getByText('May 25, 2025')).toBeTruthy();
    });
  });

  it('should navigate to individual chat when chatbox is pressed', async () => {
    (numberNameIndex as jest.Mock).mockResolvedValue({});
    (getAllChats as jest.Mock).mockResolvedValue({
      status: 200,
      data: {chats: mockChats},
    });

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <AllChats />
        </NavigationContainer>
      </Provider>
    );

    await waitFor(() => {
      expect(getByText('+1234567890')).toBeTruthy();
    });

    fireEvent.press(getByText('+1234567890'));

    await waitFor(() => {

      expect(screen.getByText('+1234567890')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('+1234567890'));

    expect(mockNavigate).toHaveBeenCalledWith('individualChat', {
      user: {
        name: '+1234567890',
        profilePicture: null,
        phoneNumber: '+1234567890',
        isBlocked: false,
        publicKey: '',
        onBlockStatusChange: expect.any(Function),
      },
    });
  });


  it('should render plus icon for adding new chats', async () => {
    await waitFor(() => {
      render(
        <Provider store={store}>
          <NavigationContainer>
            <AllChats />
          </NavigationContainer>
        </Provider>,
      );
    });
    await waitFor(() => {
      expect(screen.getByAccessibilityHint('plus-image')).toBeTruthy();
    });
  });

  it('should navigate to contacts when plus icon is pressed', async () => {
    await waitFor(() => {
      render(
        <Provider store={store}>
          <NavigationContainer>
            <AllChats />
          </NavigationContainer>
        </Provider>,
      );
    });

    await waitFor(() => {
      const plusIcon = screen.getByAccessibilityHint('plus-image');
      fireEvent.press(plusIcon);
      expect(mockNavigate).toHaveBeenCalledWith('contacts');
    });
  });

  it('should not set chats if response status is not 200', async () => {
    (numberNameIndex as jest.Mock).mockResolvedValue({});

    (getAllChats as jest.Mock).mockResolvedValue({
      status: 500,
      data: {chats: mockChats},
    });

    await waitFor(() => {
      render(
        <Provider store={store}>
          <NavigationContainer>
            <AllChats />
          </NavigationContainer>
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText('One message. Infinite possibilities.'),
      ).toBeTruthy();
    });
  });
});
