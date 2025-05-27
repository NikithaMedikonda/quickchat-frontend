import {NavigationContainer} from '@react-navigation/native';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {store} from '../../store/store';
import {AllChats, Chat} from './AllChats';
import {getAllChats} from '../../services/GetAllChats';
import {nameNumberIndex} from '../../helpers/nameNumberIndex';

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
  },
];

const emptyChats: Chat[] = [];

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockSetOptions = jest.fn();

jest.mock('../../services/GetAllChats', () => ({
  getAllChats: jest.fn(),
}));

jest.mock('../../helpers/nameNumberIndex', () => ({
  nameNumberIndex: jest.fn(),
}));

jest.mock('../../helpers/normalisePhoneNumber', () => ({
  normalise: jest.fn(),
}));

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

describe('AllChats Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display header title correctly', async () => {
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
    (getAllChats as jest.Mock).mockResolvedValue({
      status: 200,
      data: {chats: emptyChats},
    });

   (nameNumberIndex as jest.Mock).mockResolvedValue({});

    render(
      <Provider store={store}>
        <NavigationContainer>
          <AllChats />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText('One message. Infinite possibilities.'),
      ).toBeTruthy();
      expect(screen.getByText('What are you waiting for?')).toBeTruthy();
    });
  });

  it('should render all chats with correct information', async () => {
    (getAllChats as jest.Mock).mockResolvedValue({
      status: 200,
      data: {chats: mockChats},
    });

    (nameNumberIndex as jest.Mock).mockResolvedValue({
      '+1234567890': 'Test User A',
      '+1234567999': 'Test User B',
    });

   render(
      <Provider store={store}>
        <NavigationContainer>
          <AllChats />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      const profileImage = screen.getAllByAccessibilityHint('profile-image');
      expect(profileImage.length).toBe(2);
      expect(screen.getByText('+1234567890')).toBeTruthy();
      expect(screen.getByText('✓Hello there!')).toBeTruthy();
      expect(screen.getByText('Sunday')).toBeTruthy();
      expect(screen.getByText('3')).toBeTruthy();
      expect(screen.getByText('+1234567999')).toBeTruthy();
      expect(screen.getByText('✓✓How are you doing?')).toBeTruthy();
      expect(screen.getByText('Saturday')).toBeTruthy();
    });
  });

    it('should navigate to individual chat when chatbox is pressed', async () => {
      (getAllChats as jest.Mock).mockResolvedValue({
      status: 200,
      data: {chats: mockChats},
    });

    (nameNumberIndex as jest.Mock).mockResolvedValue({
      '+1234567890': 'Test User A',
      '+1234567999': 'Test User B',
    });

    render(
      <Provider store={store}>
        <NavigationContainer>
          <AllChats />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('+1234567890')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('+1234567890'));

    expect(mockNavigate).toHaveBeenCalledWith('individualChat', {
      user: {
        name: '+1234567890',
        profilePicture: null,
        phoneNumber: '+1234567890',
      },
    });
  });

  it('should render plus icon for adding new chats', async () => {
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

  it('should not set chats if response status is not 200', async () => {
    (getAllChats as jest.Mock).mockResolvedValue({
      status: 500,
      data: {chats: mockChats},
    });

    (nameNumberIndex as jest.Mock).mockResolvedValue({});

    render(
      <Provider store={store}>
        <NavigationContainer>
          <AllChats />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText('One message. Infinite possibilities.'),
      ).toBeTruthy();
    });
  });
});
