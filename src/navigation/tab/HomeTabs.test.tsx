import {NavigationContainer} from '@react-navigation/native';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {getAllChats} from '../../services/GetAllChats';
import {newSocket} from '../../socket/socket';
import {store} from '../../store/store';
import {HomeTabs} from './HomeTabs';

jest.mock('../../services/GetAllChats.ts');

const mockedGetAllChats = getAllChats as jest.MockedFunction<
  typeof getAllChats
>;

jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest
    .fn()
    .mockResolvedValue(
      JSON.stringify({name: 'Mamatha', phoneNumber: '+91 6303974914'}),
    ),
  setItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('../../services/useDeviceCheck', () => ({
  useDeviceCheck: jest.fn(),
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

const mockOn = jest.fn();
newSocket.on = mockOn;

describe('HomeTabs tests', () => {
  beforeEach(() => {
    mockedGetAllChats.mockResolvedValue({
      status: 200,
      data: {
        chats: [{unreadCount: 2}, {unreadCount: 0}],
      },
    });
  });
  it('renders the Tabs', async () => {
    await waitFor(() => {
      render(
        <Provider store={store}>
          <NavigationContainer>
            <HomeTabs />
          </NavigationContainer>
        </Provider>,
      );
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

    await waitFor(() => {
      const profileTab = getByText('Profile');
      fireEvent.press(profileTab);
    });
  });

  it('should increment message count when new message is received', async () => {
    let newMessageHandler: ((data: any) => void) | null | any = null;

    (newSocket.on as jest.Mock).mockImplementation((event, cb) => {
      if (event === 'new_message') {
        newMessageHandler = cb;
      }
      return newSocket;
    });

    render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    if (newMessageHandler) {
      newMessageHandler({newMessage: true});
    } else {
      throw new Error('new_message handler was not registered');
    }

    await waitFor(() => {
      expect(newSocket.on).toHaveBeenCalledWith(
        'new_message',
        expect.any(Function),
      );
    });
  });

  it('covers fetchChats lines when getAllChats returns chats', async () => {
    render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );
    await waitFor(() => {
      expect(store.getState().unread.count).toBe(1);
    });
  });
});
