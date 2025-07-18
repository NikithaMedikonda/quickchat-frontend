import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import {Platform} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {Provider} from 'react-redux';
import {DEFAULT_PROFILE_IMAGE} from '../../constants/defaultImage';
import {store} from '../../store/store';
import {IndividualChatHeader} from './IndividualChatHeader';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    setOptions: mockNavigate,
    goBack: mockGoBack,
  }),
}));

jest.mock('rn-fetch-blob', () => ({
  config: jest.fn(() => ({
    fetch: jest.fn(() => Promise.resolve({
      base64: jest.fn(() => Promise.resolve('mocked_base64_data')),
    })),
  })),
}));
let mockIsConnected = true;

jest.mock('../../hooks/useSocketConnection', () => ({
  useSocketConnection: () => ({
    isConnected: mockIsConnected,
  }),
}));
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));
jest.mock('react-native-contacts', () => ({
  getAll: jest.fn(() => Promise.resolve([])),
}));

describe('Test for IndividualChatHeader component', () => {
  let userDetails = {
    name: 'Chitty',
    profilePicture: '../../assets/user.png',
    phoneNumber: '',
    isBlocked: false,
    isOnline: true,
    socketId: '',
  };
  beforeEach(() => {
    render(
      <Provider store={store}>
        <IndividualChatHeader
          onBlockStatusChange={() => {}}
          setIsCleared={() => {}}
          setSocketId={()=>{}}
          publicKey={''}
          {...userDetails}
        />
        ,
      </Provider>,
    );
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(key => {
      if (key === 'user') {
        return Promise.resolve(
          JSON.stringify({
            firstName: 'test',
            lastName: 'user',
            email: 'testuser@gmail.com',
            profilePhoto: '',
            phoneNumber: '1234567890',
          }),
        );
      }
      if (key === 'authToken') {
        return Promise.resolve('mock-token');
      }
      return Promise.resolve(null);
    });
  });
  test('Should render the back arrow icon', () => {
    const backArrow = screen.getByA11yHint('back-arrow-icon');
    expect(backArrow).toBeTruthy();
  });

  test('Should render the profile picture', () => {
    const profilePicture = screen.getByA11yHint('profile-picture');
    expect(profilePicture).toBeTruthy();
  });

  test('Should render the default profile picture', () => {
    userDetails = {
      ...userDetails,

      profilePicture: '',
    };
    render(
      <Provider store={store}>
        <IndividualChatHeader
          onBlockStatusChange={() => {}}
          setIsCleared={() => {}}
          publicKey={''}
          setSocketId={() => {}}
          {...userDetails}
        />
        ,
      </Provider>,
    );
    const profilePicture = screen.getByA11yHint('profile-picture');
    expect(profilePicture.props.source).toEqual({uri: DEFAULT_PROFILE_IMAGE});
  });

  test('Should render the username', () => {
    const username = screen.getByText('Chitty');
    expect(username).toBeTruthy();
    expect(screen.getByText('Chitty')).toBeTruthy();
  });

  test('Should render the more options icon', () => {
    const moreOptions = screen.getByA11yHint('more-options-icon');
    expect(moreOptions).toBeTruthy();
  });
  test('Should go back upon clicking the back-arrow', async () => {
    const backArrow = screen.getByA11yHint('back-arrow-icon');
    await waitFor(() => {
      fireEvent.press(backArrow);
    });
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
describe('Platform-specific back arrow image tests', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      get: () => originalPlatform,
    });
  });

  test('back arrow image on iOS', () => {
    Object.defineProperty(Platform, 'OS', {
      get: () => 'ios',
    });
    render(
      <Provider store={store}>
        <IndividualChatHeader
          name="Test"
          profilePicture="someUri"
          phoneNumber=""
          isBlocked={false}
          socketId=""
          onBlockStatusChange={() => {}}
          setIsCleared={() => {}}
          setSocketId={() => {}}
          publicKey={''}
        />
        ,
      </Provider>,
    );
    const backArrow = screen.getByA11yHint('back-arrow-icon');
    expect(backArrow.props.source).toEqual(
      require('../../../src/assets/IOSBackArrowDark.png'),
    );
  });

  test('back arrow image on Android', () => {
    Object.defineProperty(Platform, 'OS', {
      get: () => 'android',
    });
    render(
      <Provider store={store}>
        <IndividualChatHeader
          name="Test"
          profilePicture="someUri"
          phoneNumber=""
          isBlocked={false}
          socketId=""
          onBlockStatusChange={() => {}}
          setIsCleared={() => {}}
          setSocketId={() => {}}
          publicKey={''}
        />
        ,
      </Provider>,
    );
    const backArrow = screen.getByA11yHint('back-arrow-icon');
    expect(backArrow.props.source).toEqual(
      require('../../../src/assets/AndroidBackArrowDark.png'),
    );
  });

  test('Should open modal when more options icon is pressed (modelVisible function)', async () => {
    Object.defineProperty(Platform, 'OS', {
      get: () => 'android',
    });
    const {queryByText} = render(
      <Provider store={store}>
        <IndividualChatHeader
          name="Test"
          socketId=""
          profilePicture="someUri"
          phoneNumber=""
          isBlocked={false}
          setSocketId={() => {}}
          onBlockStatusChange={() => {}}
          setIsCleared={() => {}}
          publicKey={''}
        />
        ,
      </Provider>,
    );
    const moreOptionsIcon = screen.getByA11yHint('more-options-icon');
    await act(async () => {
      fireEvent.press(moreOptionsIcon);
    });
    await waitFor(() => {
      expect(queryByText('Delete Chat')).toBeTruthy();
    });
  });

  test('Should close modal when onClose function is called', async () => {
    Object.defineProperty(Platform, 'OS', {
      get: () => 'android',
    });
    const {queryByText} = render(
      <Provider store={store}>
        <IndividualChatHeader
          name="Test"
          profilePicture="someUri"
          phoneNumber=""
          socketId=""
          isBlocked={false}
          onBlockStatusChange={() => {}}
          setIsCleared={() => {}}
          setSocketId={() => {}}
          publicKey={''}
        />
        ,
      </Provider>,
    );
    const closeButton = screen.getByA11yHint('back-arrow-icon');
    await act(async () => {
      fireEvent.press(closeButton);
    });
    await waitFor(() => {
      expect(queryByText('Delete Chat')).toBeNull();
    });
  });
  test('Should render the online status badge when socket id is string', () => {
    render(
      <Provider store={store}>
        <IndividualChatHeader
          name="Chitty"
          profilePicture=""
          phoneNumber=""
          isBlocked={false}
          socketId="Zhvyw6REcNc2DwgXAAAB"
          onBlockStatusChange={() => {}}
          setIsCleared={() => {}}
          setSocketId={() => {}}
          publicKey=""
        />
      </Provider>,
    );
     const onlineText = screen.queryByText('online');
     expect(onlineText).toBeTruthy();
  });

  test('Should not render the online status badge when socket id is null', () => {
    render(
      <Provider store={store}>
        <IndividualChatHeader
          name="Chitty"
          profilePicture=""
          phoneNumber=""
          isBlocked={false}
          socketId= {null}
          onBlockStatusChange={() => {}}
          setIsCleared={() => {}}
          setSocketId={() => {}}
          publicKey=""
        />
      </Provider>,
    );
    const onlineText = screen.queryByText('online');
    expect(onlineText).toBeNull();
  });
});
