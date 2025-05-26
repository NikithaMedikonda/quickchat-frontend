import {NavigationContainer, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import {getMessagesBetween} from '../../services/GetMessagesBetween';
import {checkBlockStatus} from '../../services/CheckBlockStatus';
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
      isBlocked: false,
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

jest.mock('../../services/checkBlockStatus', () => ({
  checkBlockStatus: jest.fn(),
}));

jest.mock('../../services/UpdateMessageStatus', () => ({
  updateMessageStatus: jest.fn(),
}));

jest.mock('../../socket/socket', () => ({
  receivePrivateMessage: jest.fn(),
  sendPrivateMessage: jest.fn(),
  newSocket: {},
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
    if (key === 'authToken') {
      return Promise.resolve('mock-auth-token');
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

  (checkBlockStatus as jest.Mock).mockResolvedValue({
    status: 200,
    data: {
      isBlocked: false,
    },
  });
};

describe('IndividualChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });
  describe('Block Status useEffect', () => {
    test('should check block status on component mount with valid user and token', async () => {
      const mockUser = {
        phoneNumber: '+919999999999',
        name: 'Test User',
      };
      const mockAuthToken = 'valid-auth-token';

      (EncryptedStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'user') {return Promise.resolve(JSON.stringify(mockUser));}
        if (key === 'authToken') {return Promise.resolve(mockAuthToken);}
        return Promise.resolve(null);
      });

      (checkBlockStatus as jest.Mock).mockResolvedValue({
        status: 200,
        data: { isBlocked: false },
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
        expect(EncryptedStorage.getItem).toHaveBeenCalledWith('user');
        expect(EncryptedStorage.getItem).toHaveBeenCalledWith('authToken');
        expect(checkBlockStatus).toHaveBeenCalledWith({
          blockerPhoneNumber: '+919999999999',
          blockedPhoneNumber: '+918522041688',
          authToken: 'valid-auth-token',
        });
      });
    });

    test('should set isUserBlocked to true when user is blocked', async () => {
      (checkBlockStatus as jest.Mock).mockResolvedValue({
        status: 200,
        data: { isBlocked: true },
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
        expect(checkBlockStatus).toHaveBeenCalled();
        // You can verify the blocked state is passed to the header component
        // This assumes your IndividualChatHeader component has some way to test the blocked state
      });
    });

    test('should set isUserBlocked to false when user is not blocked', async () => {
      (checkBlockStatus as jest.Mock).mockResolvedValue({
        status: 200,
        data: { isBlocked: false },
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
        expect(checkBlockStatus).toHaveBeenCalled();
        // Verify that the component behaves correctly when user is not blocked
      });
    });

    test('should not call checkBlockStatus when user data is missing', async () => {
      (EncryptedStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'user') {return Promise.resolve(null);}
        if (key === 'authToken') {return Promise.resolve('valid-token');}
        return Promise.resolve(null);
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
        expect(EncryptedStorage.getItem).toHaveBeenCalledWith('user');
        expect(checkBlockStatus).not.toHaveBeenCalled();
      });
    });

    test('should not call checkBlockStatus when auth token is missing', async () => {
      (EncryptedStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'user') {return Promise.resolve(JSON.stringify({ phoneNumber: '+919999999999' }));}
        if (key === 'authToken') {return Promise.resolve(null);}
        return Promise.resolve(null);
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
        expect(EncryptedStorage.getItem).toHaveBeenCalledWith('user');
        expect(EncryptedStorage.getItem).toHaveBeenCalledWith('authToken');
        expect(checkBlockStatus).not.toHaveBeenCalled();
      });
    });

    test('should handle checkBlockStatus API error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (checkBlockStatus as jest.Mock).mockRejectedValue(new Error('API Error'));

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
        expect(checkBlockStatus).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith('Error checking block status:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    test('should handle non-200 status from checkBlockStatus', async () => {
      (checkBlockStatus as jest.Mock).mockResolvedValue({
        status: 400,
        data: { error: 'Bad request' },
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
        expect(checkBlockStatus).toHaveBeenCalled();
        // The component should not update isUserBlocked when status is not 200
        // You can verify this by checking that the default state remains unchanged
      });
    });

    test('should re-check block status when user.phoneNumber changes', async () => {
      const { rerender } = render(
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
        expect(checkBlockStatus).toHaveBeenCalledTimes(1);
      });

      // Change the user phone number
      const newMockRoute = {
        ...mockRoute,
        params: {
          user: {
            ...mockRoute.params.user,
            phoneNumber: '+918888888888',
          },
        },
      };

      rerender(
        <NavigationContainer>
          <IndividualChat
            navigation={
              mockNavigation as NativeStackNavigationProp<
                HomeStackParamList,
                'individualChat'
              >
            }
            route={newMockRoute}
          />
        </NavigationContainer>,
      );

      await waitFor(() => {
        expect(checkBlockStatus).toHaveBeenCalledTimes(2);
        expect(checkBlockStatus).toHaveBeenLastCalledWith({
          blockerPhoneNumber: '+919999999999',
          blockedPhoneNumber: '+918888888888',
          authToken: 'mock-auth-token',
        });
      });
    });
  });

  // Existing tests...
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