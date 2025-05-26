import {NavigationContainer, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import {getMessagesBetween} from '../../services/GetMessagesBetween';
import {HomeStackParamList} from '../../types/usenavigation.type';
import {IndividualChat} from './IndividualChat';

import EncryptedStorage from 'react-native-encrypted-storage';
import {updateMessageStatus} from '../../services/UpdateMessageStatus';
import * as socket from '../../socket/socket';
type IndividualChatRouteProp = RouteProp<HomeStackParamList, 'individualChat'>;
const mockRoute: IndividualChatRouteProp = {
  key: 'individualChat',
  name: 'individualChat',
  params: {
    user: {
      name: 'Chitty',
      profilePicture: 'mock/path/to/image.png',
      phoneNumber: '+918522041688',
    },
  },
};
const mockNavigation: Partial<
  NativeStackNavigationProp<HomeStackParamList, 'individualChat'>
> = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));
jest.mock('../../services/GetMessagesBetween', () => ({
  getMessagesBetween: jest.fn(),
}));

const setupMocks = () => {
  (EncryptedStorage.getItem as jest.Mock).mockImplementation((key: string) => {
    if (key === 'user') {
      return Promise.resolve(
        JSON.stringify({
          phoneNumber: '+919999999999',
        }),
      );
    }
    return Promise.resolve(null);
  });

  (getMessagesBetween as jest.Mock).mockResolvedValue({
    status: 200,
    data: {
      chats: [
        {
          sender: {phoneNumber: '+919999999999'},
          receiver: {phoneNumber: '+918522041688'},
          content: 'Hii',
          status: 'delivered',
          createdAt: new Date().toISOString(),
        },
      ],
    },
  });

  (socket.receivePrivateMessage as jest.Mock).mockImplementation(
    (_receiverPhone, cb) => {
      cb({
        senderPhoneNumber: '+918522041688',
        recipientPhoneNumber: '+919999999999',
        message: 'Hello back',
        timestamp: new Date().toISOString(),
        status: 'sent',
      });
      return Promise.resolve({message: ''});
    },
  );
};
jest.mock('../../services/UpdateMessageStatus', () => ({
  updateMessageStatus: jest.fn(),
}));
jest.mock('../../socket/socket', () => ({
  receivePrivateMessage: jest.fn(),
  sendPrivateMessage: jest.fn(),
  newSocket: {},
}));
describe('IndividualChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });
  test('Should render the header component with user details', async () => {
    (getMessagesBetween as jest.Mock).mockResolvedValueOnce({
      status: 200,
      data: {
        chats: [
          {
            sender: {
              phoneNumber: '+919440058809',
            },
            receiver: {
              phoneNumber: '+918522041688',
            },
            status: 'delivered',
            content: 'Hii',
          },
        ],
      },
    });
    (updateMessageStatus as jest.Mock).mockResolvedValueOnce({
      status: 200,
      data: {
        count: 1,
        message: 'updated',
      },
    });
    render(
      <NavigationContainer>
        <IndividualChat
          navigation={
            mockNavigation as NativeStackNavigationProp<
              HomeStackParamList,
              'individualChat'
            >
          }
          route={mockRoute}
        />
      </NavigationContainer>,
    );
    await waitFor(() => {
      const username = screen.getByA11yHint('username-text');
      expect(username).toBeTruthy();

      const profilePicture = screen.getByA11yHint('profile-picture');
      expect(profilePicture).toBeTruthy();

      const backArrow = screen.getByA11yHint('back-arrow-icon');
      expect(backArrow).toBeTruthy();

      const moreOptions = screen.getByA11yHint('more-options-icon');
      expect(moreOptions).toBeTruthy();
      expect(screen.getByText('Hii')).toBeTruthy();
      expect(screen.getByText('Hello back')).toBeTruthy();
    });
  });

  test('Should render the message input component', async () => {
    (getMessagesBetween as jest.Mock).mockResolvedValueOnce({
      status: 200,
      data: {
        chats: [
          {
            sender: {
              phoneNumber: '+919440058809',
            },
            receiver: {
              phoneNumber: '+918522041688',
            },
            status: 'delivered',
            content: 'Hii',
          },
        ],
      },
    });
    (updateMessageStatus as jest.Mock).mockResolvedValueOnce({
      status: 200,
      data: {
        count: 1,
        message: 'updated',
      },
    });
    render(
      <NavigationContainer>
        <IndividualChat
          navigation={
            mockNavigation as NativeStackNavigationProp<
              HomeStackParamList,
              'individualChat'
            >
          }
          route={mockRoute}
        />
      </NavigationContainer>,
    );
    const inputBox = screen.getByPlaceholderText('Type a message..');
    await waitFor(() => {
      expect(inputBox).toBeTruthy();

      const sendIcon = screen.getByA11yHint('send-message-icon');
      expect(sendIcon).toBeTruthy();
    });
  });

  test('adds message to receivedMessages if message is not empty', async () => {
    (socket.receivePrivateMessage as jest.Mock).mockImplementation(
      async (_recipient, callback) => {
        const message = {
          senderPhoneNumber: '1234567890',
          recipientPhoneNumber: '9876543210',
          message: 'Hello!',
          timestamp: new Date().toISOString(),
          status: 'sent',
        };
        callback(message);
        return message;
      },
    );

    const {getByText} = render(
      <NavigationContainer>
        <IndividualChat
          navigation={
            mockNavigation as NativeStackNavigationProp<
              HomeStackParamList,
              'individualChat'
            >
          }
          route={mockRoute}
        />
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(getByText('Hello!')).toBeTruthy();
    });
  });

  test('calls sendPrivateMessage and updates sendMessages when message is sent', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        phoneNumber: '1234567890',
      }),
    );

    const mockSend = socket.sendPrivateMessage as jest.Mock;
    mockSend.mockResolvedValue({});

    const {getByPlaceholderText, getByText} = render(
      <NavigationContainer>
        <IndividualChat
          navigation={
            mockNavigation as NativeStackNavigationProp<
              HomeStackParamList,
              'individualChat'
            >
          }
          route={mockRoute}
        />
      </NavigationContainer>,
    );

    await waitFor(() =>
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith('user'),
    );

    const input = getByPlaceholderText('Type a message..');
    fireEvent.changeText(input, 'Hello, test!');
    fireEvent.press(screen.getByAccessibilityHint('send-message-icon'));
    await waitFor(() => {
      expect(mockSend).toHaveBeenCalled();
      expect(getByText('Hello, test!')).toBeTruthy();
    });

    const calledPayload = mockSend.mock.calls[0][0];
    await waitFor(() => {
      expect(calledPayload.message).toBe('Hello, test!');
      expect(calledPayload.senderPhoneNumber).toBe('1234567890');
      expect(calledPayload.recipientPhoneNumber).toBe('+918522041688');
      expect(calledPayload.status).toBe('sent');
    });
  });

  test('should set the current user phone when the user exists', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        phoneNumber: '9822416889',
      }),
    );
    (getMessagesBetween as jest.Mock).mockResolvedValue({
      status: 200,
      data: {
        chats: [
          {
            sender: {phoneNumber: '9822416889'},
            receiver: {phoneNumber: '9876543210'},
            content: 'Hello there!',
            createdAt: new Date().toISOString(),
            status: 'delivered',
          },
        ],
      },
    });
    const {getByText} = render(
      <NavigationContainer>
        <IndividualChat
          navigation={
            mockNavigation as NativeStackNavigationProp<
              HomeStackParamList,
              'individualChat'
            >
          }
          route={mockRoute}
        />
      </NavigationContainer>,
    );
    await waitFor(() => {
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith('user');
      expect(getMessagesBetween).toHaveBeenCalledWith({
        senderPhoneNumber: '9822416889',
        receiverPhoneNumber: '+918522041688',
      });
      expect(getByText('Hello there!')).toBeTruthy();
    });
  });

  test('should not set the current user phone when the user not exists', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(null);
    (getMessagesBetween as jest.Mock).mockResolvedValue({
      status: 200,
      data: {
        chats: [
          {
            sender: {phoneNumber: '9822416889'},
            receiver: {phoneNumber: '9876543210'},
            content: 'Hello there!',
            createdAt: new Date().toISOString(),
            status: 'delivered',
          },
        ],
      },
    });
    const {getByText} = render(
      <NavigationContainer>
        <IndividualChat
          navigation={
            mockNavigation as NativeStackNavigationProp<
              HomeStackParamList,
              'individualChat'
            >
          }
          route={mockRoute}
        />
      </NavigationContainer>,
    );
    await waitFor(() => {
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith('user');
      expect(getMessagesBetween).toHaveBeenCalledWith({
        senderPhoneNumber: '',
        receiverPhoneNumber: '+918522041688',
      });
      expect(getByText('Hello there!')).toBeTruthy();
    });
  });

  test('should not render the fetched messages when the status is not 200', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        phoneNumber: '9822416889',
      }),
    );
    (getMessagesBetween as jest.Mock).mockResolvedValue({
      status: 500,
      data: {
        chats: [
          {
            sender: {phoneNumber: '9822416889'},
            receiver: {phoneNumber: '9876543210'},
            content: 'Hello there!',
            createdAt: new Date().toISOString(),
            status: 'delivered',
          },
        ],
      },
    });
    const {queryByText} = render(
      <NavigationContainer>
        <IndividualChat
          navigation={
            mockNavigation as NativeStackNavigationProp<
              HomeStackParamList,
              'individualChat'
            >
          }
          route={mockRoute}
        />
      </NavigationContainer>,
    );
    await waitFor(() => {
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith('user');
      expect(queryByText('Hello there!')).toBeNull();
    });
  });

  test('should not render the empty message ', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        phoneNumber: '9822416889',
      }),
    );
    (getMessagesBetween as jest.Mock).mockResolvedValue({
      status: 200,
      data: {
        chats: [
          {
            sender: {phoneNumber: '9822416889'},
            receiver: {phoneNumber: '9876543210'},
            content: 'Hello there!',
            createdAt: new Date().toISOString(),
            status: 'delivered',
          },
        ],
      },
    });
    const {queryByText, getByPlaceholderText} = render(
      <NavigationContainer>
        <IndividualChat
          navigation={
            mockNavigation as NativeStackNavigationProp<
              HomeStackParamList,
              'individualChat'
            >
          }
          route={mockRoute}
        />
      </NavigationContainer>,
    );
    await waitFor(() =>
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith('user'),
    );
    const mockSend = socket.sendPrivateMessage as jest.Mock;
    mockSend.mockResolvedValue({});
    const input = getByPlaceholderText('Type a message..');
    fireEvent.changeText(input, '');
    fireEvent.press(screen.getByAccessibilityHint('send-message-icon'));
    await waitFor(() => {
      expect(queryByText('')).toBeNull();
    });
  });
});
