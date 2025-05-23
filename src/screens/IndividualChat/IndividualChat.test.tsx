import {NavigationContainer, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {render, screen, waitFor} from '@testing-library/react-native';

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
jest.mock('../../socket/socket');
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
    const username = screen.getByA11yHint('username-text');
    expect(username).toBeTruthy();

    const profilePicture = screen.getByA11yHint('profile-picture');
    expect(profilePicture).toBeTruthy();

    const backArrow = screen.getByA11yHint('back-arrow-icon');
    expect(backArrow).toBeTruthy();

    const moreOptions = screen.getByA11yHint('more-options-icon');
    expect(moreOptions).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText('Hii')).toBeTruthy();
      expect(screen.getByText('Hello back')).toBeTruthy();
    });
  });

  test('Should render the message input component', async() => {
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
});
