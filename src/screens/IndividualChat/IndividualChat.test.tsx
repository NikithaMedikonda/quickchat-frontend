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
import {Provider} from 'react-redux';
import {store} from '../../store/store';
import {resetForm} from '../../store/slices/registrationSlice';

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

jest.mock('../../services/CheckUserOnline', () => ({
  checkUserOnline: jest
    .fn()
    .mockResolvedValue({data: {data: {socketId: 'test-id'}}}),
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

jest.mock('../../services/UpdateMessageStatus', () => ({
  updateMessageStatus: jest.fn(),
}));
jest.mock('../../socket/socket', () => ({
  receivePrivateMessage: jest.fn(),
  sendPrivateMessage: jest.fn(),
  receiveOnline: jest.fn(),
  receiveOffline: jest.fn(),
  receiveJoined: jest.fn(),
  newSocket: {
    emit: jest.fn(),
    on: jest.fn(),
  },
}));
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
    test('should check block status on component mount with valid user and token', async () => {
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
      const username = screen.getByA11yHint('username-text');
      expect(username).toBeTruthy();

      const profilePicture = screen.getByA11yHint('profile-picture');
      expect(profilePicture).toBeTruthy();

      const backArrow = screen.getByA11yHint('back-arrow-icon');
      expect(backArrow).toBeTruthy();

      const moreOptions = screen.getByA11yHint('more-options-icon');
      expect(moreOptions).toBeTruthy();
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
      expect(getByText('Hello!')).toBeTruthy();
    });
  });

  test('calls sendPrivateMessage and updates sendMessages when message is sent', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        phoneNumber: '1234567890',
      }),
    );
    (socket.receiveOnline as jest.Mock).mockImplementation(
      async ({setIsOnline}) => setIsOnline(true),
    );

    (socket.receiveOffline as jest.Mock).mockImplementation(
      async ({setIsOnline}) => setIsOnline(false),
    );
    const mockSend = socket.sendPrivateMessage as jest.Mock;
    mockSend.mockResolvedValue({});
    const mockSocketIdResponse = {
      data: {
        data: {socketId: 'mock-socket-id'},
      },
    };

    jest
      .spyOn(require('../../services/CheckUserOnline'), 'checkUserOnline')
      .mockResolvedValue(mockSocketIdResponse);
    await waitFor(
      () => {
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
      },
      {timeout: 20000},
    );

    await waitFor(() =>
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith('user'),
    );
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Type a message..');
      fireEvent.changeText(input, 'Hello, test!');
    });

    await waitFor(() =>
      expect(screen.getByAccessibilityHint('send-message-icon')).toBeTruthy(),
    );
    await waitFor(() => {
      fireEvent.press(screen.getByAccessibilityHint('send-message-icon'));
    });

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalled();
    });
    const messageNode = await screen.findByText('Hello, test!');
    await waitFor(() => {
      expect(messageNode).toBeTruthy();
    });
    const calledPayload = (socket.sendPrivateMessage as jest.Mock).mock
      .calls[0][0];
    await waitFor(() => {
      expect(calledPayload.message).toBe('Hello, test!');
      expect(calledPayload.senderPhoneNumber).toBe('1234567890');
      expect(calledPayload.recipientPhoneNumber).toBe('+918522041688');
      expect(calledPayload.status).toBe('read');
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
      expect(getMessagesBetween).toHaveBeenCalledWith({
        senderPhoneNumber: '9822416889',
        receiverPhoneNumber: '+918522041688',
      });
    });
    const text = await screen.getByText('Hello there!');
    expect(text).toBeTruthy();
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
      expect(getMessagesBetween).toHaveBeenCalledWith({
        senderPhoneNumber: '',
        receiverPhoneNumber: '+918522041688',
      });
    });
    const text = await screen.getByText('Hello there!');
    expect(text).toBeTruthy();
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
    await waitFor(
      () => {
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
      },
      {timeout: 20000},
    );

    await waitFor(() =>
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith('user'),
    );
    const mockSend = socket.sendPrivateMessage as jest.Mock;
    await waitFor(() => {
      mockSend.mockResolvedValue({});
      mockSend.mockResolvedValue({});
    });

    const input = await screen.getByPlaceholderText('Type a message..');
    fireEvent.changeText(input, '');
    fireEvent.press(screen.getByAccessibilityHint('send-message-icon'));

    await waitFor(() => {
      expect(screen.queryByText('')).toBeNull();
    });
  });
});
