import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { getAllChats, getMissedChats } from '../../services/GetAllChats';
import { store } from '../../store/store';
import { HomeTabs } from './HomeTabs';


jest.mock('../../services/GetAllChats.ts');
jest.mock('../../socket/socket', () => {
  const mockOn = jest.fn();
  const mockOff = jest.fn();
  const mockDisconnect = jest.fn();
  const mockSocket = {
    on: mockOn,
    off: mockOff,
    disconnect: mockDisconnect,
  };
  return {
    newSocket: mockSocket,
    socketConnection: jest.fn(),
    checkDeviceStatus: jest.fn().mockResolvedValue({success: true}),
  };
});
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));


jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest
    .fn()
    .mockResolvedValue(
      JSON.stringify({name: 'Mamatha', phoneNumber: '+91 6303974914'}),
    ),
  setItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('../../database/services/messageOperations.ts', () => ({
  insertToMessages: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../database/services/userOperations', () => ({
  getLastSyncedTime: jest.fn().mockResolvedValue(new Date().toISOString()),
  updateLastSyncedTime: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../database/services/chatOperations.ts', () => ({
  getTotalUnreadCount: jest.fn().mockResolvedValue(1),
  getAllChatsFromLocal: jest.fn().mockResolvedValue([
    {
      id: 'chat1',
      unreadCount: 2,
      lastMessage: 'Hello',
      participants: ['+91 6303974914', '+91 9000000000'],
    },
  ]),
}));

jest.mock('../../database/connection/connection.ts', () => ({
  getDBInstance: jest.fn().mockResolvedValue({}),
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

jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn().mockReturnValue('mock-device-id'),
  getSystemName: jest.fn().mockReturnValue('iOS'),
  getModel: jest.fn().mockReturnValue('iPhone'),
  getDeviceId: jest.fn().mockReturnValue('iPhone12,1'),
  getSystemVersion: jest.fn().mockReturnValue('14.4'),
  getVersion: jest.fn().mockReturnValue('1.0.0'),
  getBuildNumber: jest.fn().mockReturnValue('100'),
}));

const mockedGetAllChats = getAllChats as jest.MockedFunction<
  typeof getAllChats
>;

const mockedGetMissedChats = getMissedChats as jest.MockedFunction<
  typeof getMissedChats
>;

describe('HomeTabs tests', () => {
  beforeEach(() => {
    mockedGetAllChats.mockResolvedValue({
      status: 200,
      data: {
        chats: [{unreadCount: 2}, {unreadCount: 0}],
      },
    });
    mockedGetMissedChats.mockResolvedValue({
      status: 200,
      data: [
        {
          senderPhoneNumber: '+911111111111',
          messages: [
            {
              senderPhoneNumber: '+911111111111',
              createdAt: new Date().toISOString(),
              content: 'Hello',
              status: 'delivered',
            },
          ],
        },
      ],
    });
  });

  it('renders the Tabs', async () => {
    const {getByText} = render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );
    await waitFor(() => {
      expect(getByText('All Chats')).toBeTruthy();
      expect(getByText('Unread Chats')).toBeTruthy();
      expect(getByText('Profile')).toBeTruthy();
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
    const profileTab = await waitFor(() => getByText('Profile'));
    fireEvent.press(profileTab);
  });
});
