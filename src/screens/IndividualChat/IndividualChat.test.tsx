import { NavigationContainer, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import EncryptedStorage from 'react-native-encrypted-storage';
import { Provider } from 'react-redux';
import { getDBInstance } from '../../database/connection/connection';
import { insertToMessages } from '../../database/services/messageOperations';
import {
  getQueuedMessages,
  insertToQueue,
} from '../../database/services/queueOperations';
import {
  checkBlockedStatusLocal,
  insertDeletedUser,
  isUserDeletedLocal,
} from '../../database/services/userRestriction';
import { checkBlockStatus } from '../../services/CheckBlockStatus';
import { CheckUserDeleteStatus } from '../../services/CheckUserDeleteStatus';
import { checkUserOnline } from '../../services/CheckUserOnline';
import { getMessagesBetween } from '../../services/GetMessagesBetween';
import { messageDecryption } from '../../services/MessageDecryption';
import { messageEncryption } from '../../services/MessageEncryption';
import { updateMessageStatus } from '../../services/UpdateMessageStatus';
import * as socket from '../../socket/socket';
import { resetForm } from '../../store/slices/registrationSlice';
import { store } from '../../store/store';
import { HomeStackParamList } from '../../types/usenavigation.type';
import { IndividualChat } from './IndividualChat';

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
      onBlockStatusChange: jest.fn(),
      publicKey: '123',
    },
  },
};

jest.mock('../../database/connection/connection', () => ({
  getDBInstance: jest.fn(() => ({
    executeSql: jest.fn().mockResolvedValue([]),
  })),
}));

jest.mock('../../services/useDeviceCheck', () => ({
  useDeviceCheck: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));


jest.mock('react-native-contacts', () => ({
  getAll: jest.fn(() => Promise.resolve([])),
  getContactsByPhoneNumber: jest.fn(),
  getAllWithoutPhotos: jest.fn(),
}));

jest.mock('../../database/services/messageOperations', () => ({
  getMessagesByChatId: jest.fn().mockResolvedValue([]),
  insertToMessages: jest.fn(),
  updateLocalMessageStatusToRead: jest.fn().mockResolvedValue(undefined),
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
jest.mock('../../services/CheckUserDeleteStatus', () => ({
  CheckUserDeleteStatus: jest.fn(),
}));

jest.mock('../../services/UpdateMessageStatus', () => ({
  updateMessageStatus: jest.fn(),
}));

jest.mock('../../database/services/userRestriction', () => ({
  checkBlockedStatusLocal: jest.fn(),
  insertDeletedUser: jest.fn(),
  isUserDeletedLocal: jest.fn(),
}));

jest.mock('../../database/services/queueOperations', () => ({
  insertToQueue: jest.fn(),
  getQueuedMessages: jest.fn().mockResolvedValue([]),
  updateLocalMessageStatus: jest.fn(),
  deleteFromQueue: jest.fn(),
}));

jest.mock('../../socket/socket', () => ({
  receivePrivateMessage: jest.fn(),
  sendPrivateMessage: jest.fn(),
  receiveOnline: jest.fn(),
  receiveOffline: jest.fn(),
  receiveJoined: jest.fn(),
  socketConnection: jest.fn(),
  newSocket: {
    emit: jest.fn(),
    on: jest.fn(),
  },
}));

jest.mock('../../services/CheckUserOnline', () => ({
  checkUserOnline: jest
    .fn()
    .mockResolvedValue({data: {data: {socketId: 'test-id'}}}),
}));
jest.mock('../../services/MessageEncryption', () => ({
  messageEncryption: jest.fn(),
}));

jest.mock('../../services/MessageDecryption', () => ({
  messageDecryption: jest.fn(),
}));

const mockExecuteSql = jest.fn();
(getDBInstance as jest.Mock).mockResolvedValue({
  executeSql: mockExecuteSql,
});

let mockIsConnected = true;

jest.mock('../../hooks/useSocketConnection', () => ({
  useSocketConnection: () => ({
    isConnected: mockIsConnected,
  }),
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
    if (key === 'privateKey') {
      return Promise.resolve('mock-private-key');
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
          content: 'encrypted-content',
          status: 'delivered',
          createdAt: new Date().toISOString(),
        },
      ],
    },
  });

  (messageDecryption as jest.Mock).mockResolvedValue('Hello there!');

  (socket.receivePrivateMessage as jest.Mock).mockImplementation(
    (_receiverPhone, cb) => {
      setTimeout(() => {
        cb({
          senderPhoneNumber: '+918522041688',
          recipientPhoneNumber: '+919999999999',
          message: 'Hello!',
          timestamp: new Date().toISOString(),
          status: 'sent',
        });
      }, 100);
      return Promise.resolve({message: ''});
    },
  );

  (checkBlockStatus as jest.Mock).mockResolvedValue({
    status: 200,
    data: {
      isBlocked: false,
    },
  });

  (messageEncryption as jest.Mock).mockResolvedValue('encrypted-message');
};

describe('IndividualChat', () => {
  beforeEach(() => {
    (socket.receiveOnline as jest.Mock).mockImplementation(
      async ({setIsOnline}) => {
        setIsOnline(true);
      },
    );

    (socket.receiveOffline as jest.Mock).mockImplementation(
      async ({setIsOnline}) => {
        setIsOnline(false);
      },
    );
    jest.clearAllMocks();
    setupMocks();
    store.dispatch(resetForm());
  });

  describe('Block Status useEffect', () => {
    test('should check local block status when offline', async () => {
      mockIsConnected = false;
      (getDBInstance as jest.Mock).mockResolvedValue({
        executeSql: jest.fn().mockResolvedValue([
          {
            rows: {
              length: 1,
              item: () => ({
                blockerPhoneNumber: '+919999999999',
                blockedPhoneNumber: '+918522041688',
              }),
            },
          },
        ]),
      });

      const mockUser = {
        phoneNumber: '+919999999999',
        name: 'Test User',
      };

      (EncryptedStorage.getItem as jest.Mock).mockImplementation(
        (key: string) => {
          if (key === 'user') {
            return Promise.resolve(JSON.stringify(mockUser));
          }
          if (key === 'authToken') {
            return Promise.resolve('mock-auth-token');
          }
          return Promise.resolve(null);
        },
      );

      render(
        <NavigationContainer>
          <Provider store={store}>
            <IndividualChat
              navigation={mockNavigation as any}
              route={mockRoute}
            />
          </Provider>
        </NavigationContainer>,
      );

      await waitFor(() => {
        expect(checkBlockStatus).not.toHaveBeenCalled();
        expect(checkBlockedStatusLocal).toHaveBeenCalled();
      });
    });

    test('should check block status on component mount with valid user and token', async () => {
      mockExecuteSql.mockResolvedValue([
        {
          rows: {
            length: 1,
            item: (index: number) => ({
              id: index + 1,
              content: 'Mock message',
            }),
          },
        },
      ]);
      mockIsConnected = true;
      const mockUser = {
        phoneNumber: '+919999999999',
        name: 'Test User',
      };
      const mockAuthToken = 'valid-auth-token';

      (EncryptedStorage.getItem as jest.Mock).mockImplementation(
        (key: string) => {
          if (key === 'user') {
            return Promise.resolve(JSON.stringify(mockUser));
          }
          if (key === 'authToken') {
            return Promise.resolve(mockAuthToken);
          }
          return Promise.resolve(null);
        },
      );

      (checkBlockStatus as jest.Mock).mockResolvedValue({
        status: 200,
        data: {isBlocked: false},
      });

      render(
        <NavigationContainer>
          <Provider store={store}>
            <IndividualChat
              navigation={
                mockNavigation as NativeStackNavigationProp<
                  HomeStackParamList,
                  'individualChat'
                >
              }
              route={mockRoute}
            />
          </Provider>
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
        data: {isBlocked: true},
      });

      render(
        <NavigationContainer>
          <Provider store={store}>
            <IndividualChat
              navigation={
                mockNavigation as NativeStackNavigationProp<
                  HomeStackParamList,
                  'individualChat'
                >
              }
              route={mockRoute}
            />
          </Provider>
        </NavigationContainer>,
      );

      await waitFor(() => {
        expect(checkBlockStatus).toHaveBeenCalled();
      });
    });

    test('should set isUserBlocked to false when user is not blocked', async () => {
      (checkBlockStatus as jest.Mock).mockResolvedValue({
        status: 200,
        data: {isBlocked: false},
      });

      render(
        <NavigationContainer>
          <Provider store={store}>
            <IndividualChat
              navigation={
                mockNavigation as NativeStackNavigationProp<
                  HomeStackParamList,
                  'individualChat'
                >
              }
              route={mockRoute}
            />
          </Provider>
        </NavigationContainer>,
      );

      await waitFor(() => {
        expect(checkBlockStatus).toHaveBeenCalled();
      });
    });

    test('should not call checkBlockStatus when user data is missing', async () => {
      (EncryptedStorage.getItem as jest.Mock).mockImplementation(
        (key: string) => {
          if (key === 'user') {
            return Promise.resolve(null);
          }
          if (key === 'authToken') {
            return Promise.resolve('valid-token');
          }
          return Promise.resolve(null);
        },
      );

      render(
        <NavigationContainer>
          <Provider store={store}>
            <IndividualChat
              navigation={
                mockNavigation as NativeStackNavigationProp<
                  HomeStackParamList,
                  'individualChat'
                >
              }
              route={mockRoute}
            />
          </Provider>
        </NavigationContainer>,
      );

      await waitFor(() => {
        expect(EncryptedStorage.getItem).toHaveBeenCalledWith('user');
        expect(checkBlockStatus).not.toHaveBeenCalled();
      });
    });

    test('should not call checkBlockStatus when auth token is missing', async () => {
      (EncryptedStorage.getItem as jest.Mock).mockImplementation(
        (key: string) => {
          if (key === 'user') {
            return Promise.resolve(
              JSON.stringify({phoneNumber: '+919999999999'}),
            );
          }
          if (key === 'authToken') {
            return Promise.resolve(null);
          }
          return Promise.resolve(null);
        },
      );

      render(
        <NavigationContainer>
          <Provider store={store}>
            <IndividualChat
              navigation={
                mockNavigation as NativeStackNavigationProp<
                  HomeStackParamList,
                  'individualChat'
                >
              }
              route={mockRoute}
            />
          </Provider>
        </NavigationContainer>,
      );

      await waitFor(() => {
        expect(EncryptedStorage.getItem).toHaveBeenCalledWith('user');
        expect(EncryptedStorage.getItem).toHaveBeenCalledWith('authToken');
        expect(checkBlockStatus).not.toHaveBeenCalled();
      });
    });

    test('should handle checkBlockStatus API error gracefully', async () => {
      (checkBlockStatus as jest.Mock).mockRejectedValue(new Error('API Error'));
      render(
        <NavigationContainer>
          <Provider store={store}>
            <IndividualChat
              navigation={
                mockNavigation as NativeStackNavigationProp<
                  HomeStackParamList,
                  'individualChat'
                >
              }
              route={mockRoute}
            />
          </Provider>
        </NavigationContainer>,
      );

      await waitFor(() => {
        const state = store.getState();
        expect(state.registration.alertMessage).toBe('Unable to fetch details');
        expect(state.registration.alertType).toBe('info');
      });
    });

    test('should handle non-200 status from checkBlockStatus', async () => {
      (checkBlockStatus as jest.Mock).mockResolvedValue({
        status: 400,
        data: {error: 'Bad request'},
      });

      render(
        <NavigationContainer>
          <Provider store={store}>
            <IndividualChat
              navigation={
                mockNavigation as NativeStackNavigationProp<
                  HomeStackParamList,
                  'individualChat'
                >
              }
              route={mockRoute}
            />
          </Provider>
        </NavigationContainer>,
      );

      await waitFor(() => {
        expect(checkBlockStatus).toHaveBeenCalled();
      });
    });

    test('should re-check block status when user.phoneNumber changes', async () => {
      const {rerender} = render(
        <NavigationContainer>
          <Provider store={store}>
            <IndividualChat
              navigation={
                mockNavigation as NativeStackNavigationProp<
                  HomeStackParamList,
                  'individualChat'
                >
              }
              route={mockRoute}
            />
          </Provider>
        </NavigationContainer>,
      );

      await waitFor(() => {
        expect(checkBlockStatus).toHaveBeenCalledTimes(1);
      });

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
          <Provider store={store}>
            <IndividualChat
              navigation={
                mockNavigation as NativeStackNavigationProp<
                  HomeStackParamList,
                  'individualChat'
                >
              }
              route={newMockRoute}
            />
          </Provider>
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

  test('Should render the header component with user details', async () => {
    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={
              mockNavigation as NativeStackNavigationProp<
                HomeStackParamList,
                'individualChat'
              >
            }
            route={mockRoute}
          />
        </Provider>
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(screen.getByA11yHint('username-text')).toBeTruthy();
      expect(screen.getByA11yHint('profile-picture')).toBeTruthy();
      expect(screen.getByA11yHint('back-arrow-icon')).toBeTruthy();
      expect(screen.getByA11yHint('more-options-icon')).toBeTruthy();
    });
  });

  test('Should render the message input component', async () => {
    (updateMessageStatus as jest.Mock).mockResolvedValueOnce({
      status: 200,
      data: {
        count: 1,
        message: 'updated',
      },
    });
    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={
              mockNavigation as NativeStackNavigationProp<
                HomeStackParamList,
                'individualChat'
              >
            }
            route={mockRoute}
          />
        </Provider>
      </NavigationContainer>,
    );
    const inputBox = screen.getByPlaceholderText('Type a message..');
    await waitFor(() => {
      expect(inputBox).toBeTruthy();

      const sendIcon = screen.getByA11yHint('send-message-icon');
      expect(sendIcon).toBeTruthy();
    });
  });
  test('should call selfChat when sender and recipient phone numbers are the same', async () => {
    const testMessage = 'Hello to self';
    const encryptedMessage = 'encrypted-hello';
    mockIsConnected = true;
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(
      async (key: string) => {
        if (key === 'user') {
          return JSON.stringify({phoneNumber: '+918522041688'});
        }
        if (key === 'privateKey') {
          return 'mock-private-key';
        }
        return null;
      },
    );
    (socket.sendPrivateMessage as jest.Mock).mockResolvedValue({});
    (messageEncryption as jest.Mock).mockResolvedValue(encryptedMessage);
    (insertToMessages as jest.Mock).mockResolvedValue({});
    (insertToQueue as jest.Mock).mockResolvedValue({});

    (socket.receiveOnline as jest.Mock).mockImplementation(
      async ({setIsOnline}) => setIsOnline(true),
    );

    (socket.receiveOffline as jest.Mock).mockImplementation(
      async ({setIsOnline}) => setIsOnline(false),
    );
    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={
              mockNavigation as NativeStackNavigationProp<
                HomeStackParamList,
                'individualChat'
              >
            }
            route={mockRoute}
          />
        </Provider>
      </NavigationContainer>,
    );

    const input = await screen.getByPlaceholderText('Type a message..');
    fireEvent.changeText(input, testMessage);

    const sendButton = await screen.getByA11yHint('send-message-icon');
    fireEvent.press(sendButton);
    await waitFor(() => {
      expect(insertToMessages).toHaveBeenCalledTimes(1);
    });
  });
  test('adds message to receivedMessages if message is not empty', async () => {
    mockIsConnected = true;

    (messageDecryption as jest.Mock).mockResolvedValue('Hello!');

    (socket.receivePrivateMessage as jest.Mock).mockImplementation(
      (_recipient, callback) => {
        setTimeout(() => {
          callback({
            senderPhoneNumber: '+918522041688',
            recipientPhoneNumber: '+919999999999',
            message: 'encrypted-hello',
            timestamp: new Date().toISOString(),
            status: 'delivered',
          });
        }, 100);
        return Promise.resolve();
      },
    );

    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={
              mockNavigation as NativeStackNavigationProp<
                HomeStackParamList,
                'individualChat'
              >
            }
            route={mockRoute}
          />
        </Provider>
      </NavigationContainer>,
    );

    await waitFor(
      () => {
        expect(screen.getByText('Hello!')).toBeTruthy();
      },
      {timeout: 2000},
    );
  });

  test('calls sendPrivateMessage and updates sendMessages when message is sent', async () => {
    mockIsConnected = true;
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => {
        if (key === 'user') {
          return Promise.resolve(
            JSON.stringify({
              phoneNumber: '+919999999999',
              name: 'Test User',
            }),
          );
        }
        if (key === 'privateKey') {
          return Promise.resolve('mock-private-key');
        }
        if (key === 'authToken') {
          return Promise.resolve('mock-auth-token');
        }
        return Promise.resolve(null);
      },
    );

    (messageEncryption as jest.Mock).mockResolvedValue('encrypted-message');
    (socket.sendPrivateMessage as jest.Mock).mockResolvedValue({});
    (socket.receiveOnline as jest.Mock).mockImplementation(
      async ({setIsOnline}) => setIsOnline(true),
    );
    (socket.receiveOffline as jest.Mock).mockImplementation(
      async ({setIsOnline}) => setIsOnline(false),
    );

    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={
              mockNavigation as NativeStackNavigationProp<
                HomeStackParamList,
                'individualChat'
              >
            }
            route={mockRoute}
          />
        </Provider>
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith('user');
    });

    const input = screen.getByPlaceholderText('Type a message..');
    const sendButton = screen.getByA11yHint('send-message-icon');

    fireEvent.changeText(input, 'Hello, test!');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(socket.sendPrivateMessage).toHaveBeenCalled();
    });

    const calledPayload = (socket.sendPrivateMessage as jest.Mock).mock
      .calls[0][0];
    expect(calledPayload.senderPhoneNumber).toBe('+919999999999');
    expect(calledPayload.recipientPhoneNumber).toBe('+918522041688');
    expect(calledPayload.message).toBe('encrypted-message');
    expect(calledPayload.status).toBeDefined();
    await waitFor(() => {
      expect(screen.getByText('Hello, test!')).toBeTruthy();
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
    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={
              mockNavigation as NativeStackNavigationProp<
                HomeStackParamList,
                'individualChat'
              >
            }
            route={mockRoute}
          />
        </Provider>
      </NavigationContainer>,
    );
    await waitFor(() => {
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith('user');
      expect(screen.queryByText('Hello there!')).toBeNull();
    });
  });

  test('should not render the empty message ', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        phoneNumber: '9822416889',
      }),
    );

    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={
              mockNavigation as NativeStackNavigationProp<
                HomeStackParamList,
                'individualChat'
              >
            }
            route={mockRoute}
          />
        </Provider>
      </NavigationContainer>,
    );
    const mockSend = socket.sendPrivateMessage as jest.Mock;
    mockSend.mockResolvedValue({});

    const input = screen.getByPlaceholderText('Type a message..');
    fireEvent.changeText(input, '');
    fireEvent.press(screen.getByAccessibilityHint('send-message-icon'));

    await waitFor(() => {
      expect(mockSend).not.toHaveBeenCalled();
    });
  });

  test('should sendPrivateMessage and the messages should be read when the user is online with this user', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => {
        if (key === 'user') {
          return Promise.resolve(
            JSON.stringify({phoneNumber: '+919999999999'}),
          );
        }
        if (key === 'privateKey') {
          return Promise.resolve('mock-private-key');
        }
        if (key === 'authToken') {
          return Promise.resolve('mock-auth-token');
        }
        return Promise.resolve(null);
      },
    );
    (messageEncryption as jest.Mock).mockResolvedValue('encrypted-message');
    (socket.sendPrivateMessage as jest.Mock).mockResolvedValue({});

    (socket.receiveOnline as jest.Mock).mockImplementation(
      async ({setIsOnline}) => setIsOnline(true),
    );
    (socket.receiveOffline as jest.Mock).mockImplementation(
      async ({setIsOnline}) => setIsOnline(false),
    );
    (checkUserOnline as jest.Mock).mockResolvedValue({
      status: 200,
      data: {data: {socketId: '12332431'}},
    });
    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={
              mockNavigation as NativeStackNavigationProp<
                HomeStackParamList,
                'individualChat'
              >
            }
            route={mockRoute}
          />
        </Provider>
      </NavigationContainer>,
    );
    const input = screen.getByPlaceholderText('Type a message..');
    const sendButton = screen.getByA11yHint('send-message-icon');

    fireEvent.changeText(input, 'Hello there!');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(socket.sendPrivateMessage).toHaveBeenCalled();
    });

    const calledPayload = (socket.sendPrivateMessage as jest.Mock).mock
      .calls[0][0];
    expect(calledPayload.senderPhoneNumber).toBe('+919999999999');
    expect(calledPayload.recipientPhoneNumber).toBe('+918522041688');
    expect(calledPayload.message).toBe('encrypted-message');

    await waitFor(() => {
      const elements = screen.getAllByText('Hello there!');
      expect(elements).toBeTruthy();
    });
  });

  test('should sendPrivateMessage and the messages should be delivered when the user is online with this user', async () => {
    mockIsConnected = true;
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => {
        if (key === 'user') {
          return Promise.resolve(
            JSON.stringify({phoneNumber: '+919999999999'}),
          );
        }
        if (key === 'privateKey') {
          return Promise.resolve('mock-private-key');
        }
        if (key === 'authToken') {
          return Promise.resolve('mock-auth-token');
        }
        return Promise.resolve(null);
      },
    );
    (messageEncryption as jest.Mock).mockResolvedValue('encrypted-message');
    (socket.sendPrivateMessage as jest.Mock).mockResolvedValue({});

    (socket.receiveOnline as jest.Mock).mockImplementation(
      async ({setIsOnline}) => setIsOnline(false),
    );
    (socket.receiveOffline as jest.Mock).mockImplementation(
      async ({setIsOnline}) => setIsOnline(false),
    );
    (checkUserOnline as jest.Mock).mockResolvedValue({
      status: 200,
      data: {data: {socketId: '12332431'}},
    });
    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={
              mockNavigation as NativeStackNavigationProp<
                HomeStackParamList,
                'individualChat'
              >
            }
            route={mockRoute}
          />
        </Provider>
      </NavigationContainer>,
    );
    await waitFor(() => {
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith('user');
    });

    const input = screen.getByPlaceholderText('Type a message..');
    const sendButton = screen.getByA11yHint('send-message-icon');

    fireEvent.changeText(input, 'Hello, test!');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(socket.sendPrivateMessage).toHaveBeenCalled();
    });

    const calledPayload = (socket.sendPrivateMessage as jest.Mock).mock
      .calls[0][0];
    expect(calledPayload.senderPhoneNumber).toBe('+919999999999');
    expect(calledPayload.recipientPhoneNumber).toBe('+918522041688');
    expect(calledPayload.message).toBe('encrypted-message');
    expect(calledPayload.status).toBe('delivered');

    await waitFor(() => {
      expect(screen.getByText('Hello, test!')).toBeTruthy();
    });
  });
});

describe('User Delete Status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
    mockIsConnected = true;
  });

  test('should call CheckUserDeleteStatus when local check returns false', async () => {
    (isUserDeletedLocal as jest.Mock).mockResolvedValue(false);
    (CheckUserDeleteStatus as jest.Mock).mockResolvedValue({
      status: 200,
      data: {isDeleted: true},
    });

    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={mockNavigation as any}
            route={mockRoute}
          />
        </Provider>
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(isUserDeletedLocal).toHaveBeenCalledWith('+918522041688');
    });

    await waitFor(() => {
      expect(CheckUserDeleteStatus).toHaveBeenCalled();
    });
  });

  test('should not call CheckUserDeleteStatus when local check returns true', async () => {
    (isUserDeletedLocal as jest.Mock).mockResolvedValue(true);

    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={mockNavigation as any}
            route={mockRoute}
          />
        </Provider>
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(isUserDeletedLocal).toHaveBeenCalledWith('+918522041688');
    });

    expect(CheckUserDeleteStatus).not.toHaveBeenCalled();
  });

  test('should set isDeleted to true when user is deleted', async () => {
    (isUserDeletedLocal as jest.Mock).mockResolvedValue(false);
    (CheckUserDeleteStatus as jest.Mock).mockResolvedValue({
      status: 200,
      data: {isDeleted: true},
    });

    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={
              mockNavigation as NativeStackNavigationProp<
                HomeStackParamList,
                'individualChat'
              >
            }
            route={mockRoute}
          />
        </Provider>
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(CheckUserDeleteStatus).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(insertDeletedUser).toHaveBeenCalledWith('+918522041688');
    });
  });

  test('should set isdeleted to false when user is not deleted', async () => {
    (isUserDeletedLocal as jest.Mock).mockResolvedValue(false);
    (CheckUserDeleteStatus as jest.Mock).mockResolvedValue({
      status: 200,
      data: {isDeleted: false},
    });

    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={
              mockNavigation as NativeStackNavigationProp<
                HomeStackParamList,
                'individualChat'
              >
            }
            route={mockRoute}
          />
        </Provider>
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(CheckUserDeleteStatus).toHaveBeenCalled();
    });
  });

  test('should use local deleted status when offline', async () => {
    mockIsConnected = false;
    (isUserDeletedLocal as jest.Mock).mockResolvedValue(true);

    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={mockNavigation as any}
            route={mockRoute}
          />
        </Provider>
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(isUserDeletedLocal).toHaveBeenCalledWith('+918522041688');
    });

    expect(CheckUserDeleteStatus).not.toHaveBeenCalled();
  });

  test('should handle CheckUserDeleteStatus API error gracefully', async () => {
    (isUserDeletedLocal as jest.Mock).mockResolvedValue(false);
    (CheckUserDeleteStatus as jest.Mock).mockRejectedValue(
      new Error('API Error'),
    );
    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={
              mockNavigation as NativeStackNavigationProp<
                HomeStackParamList,
                'individualChat'
              >
            }
            route={mockRoute}
          />
        </Provider>
      </NavigationContainer>,
    );

    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertType).toBe('info');
    });
  });

  test('should handle non-200 status from CheckUserDeleteStatus', async () => {
    (isUserDeletedLocal as jest.Mock).mockResolvedValue(false);
    (CheckUserDeleteStatus as jest.Mock).mockResolvedValue({
      status: 400,
      data: {error: 'Bad request'},
    });

    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={
              mockNavigation as NativeStackNavigationProp<
                HomeStackParamList,
                'individualChat'
              >
            }
            route={mockRoute}
          />
        </Provider>
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(CheckUserDeleteStatus).toHaveBeenCalled();
    });
  });

  test('should not call CheckUserDeleteStatus when auth token is missing', async () => {
    jest.clearAllMocks();
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => {
        if (key === 'authToken') {
          return Promise.resolve(null);
        }
        return Promise.resolve(null);
      },
    );

    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={mockNavigation as any}
            route={mockRoute}
          />
        </Provider>
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith('authToken');
    });

    expect(CheckUserDeleteStatus).not.toHaveBeenCalled();
  });

  test('should re-check delete status when user.phoneNumber changes', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => {
        if (key === 'authToken') {
          return Promise.resolve('mock-auth-token');
        }

        return Promise.resolve(null);
      },
    );
    (isUserDeletedLocal as jest.Mock).mockResolvedValue(false);
    (CheckUserDeleteStatus as jest.Mock).mockResolvedValue({
      status: 200,
      data: {isDeleted: false},
    });

    const {rerender} = render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={mockNavigation as any}
            route={mockRoute}
          />
        </Provider>
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(CheckUserDeleteStatus).toHaveBeenCalled();
    });

    jest.clearAllMocks();

    rerender(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={mockNavigation as any}
            route={{
              ...mockRoute,
              params: {
                user: {
                  ...mockRoute.params.user,
                  phoneNumber: '+918888888888',
                },
              },
            }}
          />
        </Provider>
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(CheckUserDeleteStatus).toHaveBeenCalled();
      expect(CheckUserDeleteStatus).toHaveBeenCalledWith({
        authToken: 'mock-auth-token',
        phoneNumber: '+918888888888',
      });
    });
  });

  test('should store message as pending when there is no internet connection (isConnected=false)', async () => {
    mockExecuteSql.mockResolvedValueOnce([
      {
        rows: {
          length: 1,
          item: () => ({id: '123', message: 'Hello'}),
        },
      },
    ]);
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => {
        if (key === 'user') {
          return Promise.resolve(
            JSON.stringify({phoneNumber: '+919999999999'}),
          );
        }
        if (key === 'privateKey') {
          return Promise.resolve('mock-private-key');
        }
        if (key === 'authToken') {
          return Promise.resolve('mock-auth-token');
        }
        return Promise.resolve(null);
      },
    );

    (messageEncryption as jest.Mock).mockResolvedValue('encrypted-message');
    mockIsConnected = false;
    (socket.sendPrivateMessage as jest.Mock).mockClear();

    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={
              mockNavigation as NativeStackNavigationProp<
                HomeStackParamList,
                'individualChat'
              >
            }
            route={mockRoute}
          />
        </Provider>
      </NavigationContainer>,
    );

    const input = screen.getByPlaceholderText('Type a message..');
    const sendButton = screen.getByA11yHint('send-message-icon');

    fireEvent.changeText(input, 'Offline message');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(socket.sendPrivateMessage).not.toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(insertToQueue as jest.Mock).toHaveBeenCalled();
      expect(insertToMessages as jest.Mock).toHaveBeenCalled();
    });

    const queuedPayload = (insertToQueue as jest.Mock).mock.calls[0][0];
    expect(queuedPayload.status).toBe('pending');
    expect(queuedPayload.message).toBe('encrypted-message');
    expect(queuedPayload.senderPhoneNumber).toBe('+919999999999');
    expect(queuedPayload.receiverPhoneNumber).toBe('+918522041688');

    await waitFor(() => {
      expect(screen.getByText('Offline message')).toBeTruthy();
    });
  });
});

describe('Test for IndividualChat processing queuing messages', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (EncryptedStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => {
        if (key === 'user') {
          return Promise.resolve(
            JSON.stringify({
              phoneNumber: '+911234567890',
              publicKey: 'publicKey1',
            }),
          );
        }
        if (key === 'authToken') {
          return Promise.resolve('mock-auth-token');
        }
        if (key === 'privateKey') {
          return Promise.resolve('mock-private-key');
        }
        return Promise.resolve(null);
      },
    );

    (checkUserOnline as jest.Mock).mockResolvedValue({
      status: 200,
      data: {data: {socketId: 'socket-123'}},
    });

    (getQueuedMessages as jest.Mock).mockResolvedValue([]);

    (messageDecryption as jest.Mock).mockImplementation(
      async ({encryptedMessage}) => {
        return 'decrypted:' + encryptedMessage;
      },
    );
  });

  it('renders and processes queued messages with socket connection', async () => {
    (socket.sendPrivateMessage as jest.Mock).mockResolvedValue({});
    (getQueuedMessages as jest.Mock).mockResolvedValue([
      {
        id: 'msg1',
        message: 'encryptedMessage1',
        receiverPhoneNumber: '+918522041688',
        senderPhoneNumber: '+911234567890',
        timestamp: '1234567890',
      },
      {
        id: 'msg2',
        message: 'encryptedMessage2',
        receiverPhoneNumber: '+918522041688',
        senderPhoneNumber: '+911234567890',
        timestamp: '1234567891',
      },
    ]);
    mockIsConnected = true;
    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={mockNavigation as any}
            route={mockRoute as any}
          />
        </Provider>
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(socket.newSocket.emit as jest.Mock).toHaveBeenCalledWith(
        'online_with',
        mockRoute.params.user.phoneNumber,
      );

      expect(checkUserOnline as jest.Mock).toHaveBeenCalledWith({
        phoneNumber: mockRoute.params.user.phoneNumber,
        authToken: 'mock-auth-token',
        requestedUserPhoneNumber: '+911234567890',
      });
    });
  });

  it('handles no queued messages gracefully', async () => {
    mockIsConnected = true;
    (getQueuedMessages as jest.Mock).mockResolvedValueOnce([]);

    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={mockNavigation as any}
            route={mockRoute as any}
          />
        </Provider>
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(socket.sendPrivateMessage as jest.Mock).not.toHaveBeenCalled();
    });
  });

  it('sets socketId state correctly when checkUserOnline returns 200', async () => {
    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={mockNavigation as any}
            route={mockRoute as any}
          />
        </Provider>
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(checkUserOnline as jest.Mock).toHaveBeenCalled();
    });
  });

  test('should call selfChat when sender and recipient phone numbers are the same, even in the offline mode', async () => {
    const testMessage = 'Hello to self';
    const encryptedMessage = 'encrypted-hello';
    mockIsConnected = false;
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(
      async (key: string) => {
        if (key === 'user') {
          return JSON.stringify({phoneNumber: '+918522041688'});
        }
        if (key === 'privateKey') {
          return 'mock-private-key';
        }
        return null;
      },
    );
    (socket.sendPrivateMessage as jest.Mock).mockResolvedValue({});
    (messageEncryption as jest.Mock).mockResolvedValue(encryptedMessage);
    (insertToMessages as jest.Mock).mockResolvedValue({});
    (insertToQueue as jest.Mock).mockResolvedValue({});

    (socket.receiveOnline as jest.Mock).mockImplementation(
      async ({setIsOnline}) => setIsOnline(true),
    );

    (socket.receiveOffline as jest.Mock).mockImplementation(
      async ({setIsOnline}) => setIsOnline(false),
    );
    render(
      <NavigationContainer>
        <Provider store={store}>
          <IndividualChat
            navigation={
              mockNavigation as NativeStackNavigationProp<
                HomeStackParamList,
                'individualChat'
              >
            }
            route={mockRoute}
          />
        </Provider>
      </NavigationContainer>,
    );

    const input = await screen.getByPlaceholderText('Type a message..');
    fireEvent.changeText(input, testMessage);

    const sendButton = await screen.getByA11yHint('send-message-icon');
    fireEvent.press(sendButton);
    await waitFor(() => {
      expect(insertToMessages).toHaveBeenCalledTimes(1);
      expect(insertToQueue).toHaveBeenCalledTimes(1);
    });
  });

});

