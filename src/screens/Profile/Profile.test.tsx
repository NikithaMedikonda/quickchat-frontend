import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {Profile} from './Profile';
import {ProfileMoreOptionsModal} from '../../components/ProfileMoreOptionsModal/ProfileMoreOptionsModal';
import {Provider} from 'react-redux';
import {store} from '../../store/store';
import {AlertNotificationRoot} from 'react-native-alert-notification';
import { DEFAULT_PROFILE_IMAGE } from '../../constants/defaultImage';
import React from 'react';

jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(),
}));

jest.mock('../../services/useDeviceCheck', () => ({
  useDeviceCheck: jest.fn(),
}));

jest.mock('react-native-alert-notification', () => ({
  ALERT_TYPE: {
    DANGER: 'DANGER',
  },
  Dialog: {
    show: jest.fn(),
  },
  AlertNotificationRoot: ({children}: {children: React.ReactNode}) => children,
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    setOptions: mockNavigate,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockUserData = {
  firstName: 'Goldie',
  lastName: 'Sanugula',
  profilePicture: '',
  email: 'anoosha@gmail.com',
  phoneNumber: '9988334455',
  isDeleted: false,
};

const TestWrapper = () => {
  const [modalVisible, setModalVisible] = React.useState(true);

  const onClose = () => {
    setModalVisible(false);
  };

  return (
    <Provider store={store}>
      <AlertNotificationRoot>
        <ProfileMoreOptionsModal visible={modalVisible} onClose={onClose} />
      </AlertNotificationRoot>
    </Provider>
  );
};

describe('Profile Screen', () => {
  beforeEach(() => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(mockUserData),
    );
  });
  const renderComponent = () =>
    render(
      <Provider store={store}>
        <AlertNotificationRoot>
          <Profile />
        </AlertNotificationRoot>
      </Provider>,
    );
  it('renders the dot image', async () => {
    await waitFor(() => {
      renderComponent();
    });
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        headerTitleAlign: 'center',
        headerRight: expect.any(Function),
      }),
    );

    const headerRight = mockNavigate.mock.calls[0][0].headerRight();
    const {getByA11yHint} = render(headerRight);
    expect(getByA11yHint('dots-image')).toBeTruthy();
    expect(mockNavigate).toHaveBeenCalledWith({
      headerTitleAlign: 'center',
      headerRight: expect.any(Function),
    });
  });

  it('renders the fallback profile image if profilePicture is empty', async () => {
    await waitFor(() => {
      renderComponent();
    });
    const profileImage = await waitFor(() =>
      screen.getByA11yHint('profile-image'),
    );
    expect(profileImage).toBeTruthy();
  });

  it('renders the first name section correctly', async () => {
    await waitFor(() => {
      renderComponent();
    });
    expect(await screen.findByText('First Name')).toBeTruthy();
    expect(await screen.findByText(mockUserData.firstName)).toBeTruthy();
  });

  it('renders the last name section correctly', async () => {
    await waitFor(() => {
      renderComponent();
    });
    expect(await screen.findByText('Last Name')).toBeTruthy();
    expect(await screen.findByText(mockUserData.lastName)).toBeTruthy();
  });

  it('renders the email section correctly', async () => {
    await waitFor(() => {
      renderComponent();
    });
    expect(await screen.findByText('Email')).toBeTruthy();
    expect(await screen.findByText(mockUserData.email)).toBeTruthy();
  });

  it('renders the phone number section correctly', async () => {
    await waitFor(() => {
      renderComponent();
    });
    expect(await screen.findByText('Phone Number')).toBeTruthy();
    expect(await screen.findByText(mockUserData.phoneNumber)).toBeTruthy();
  });

  it('loads user data from Encrypted storage and displays profile image', async () => {
    const mockUser = {
      profilePicture: 'https://example.com/profile.jpg',
      firstName: 'Anoosha',
    };
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(mockUser),
    );
    await waitFor(() => {
      renderComponent();
    });
    const image = await waitFor(() => screen.getByA11yHint('profile-image'));
    expect(image).toBeTruthy();
  });

  it('opens the modal when dots image is pressed', async () => {
    await waitFor(() => {
      renderComponent();
    });
    const headerRight = mockNavigate.mock.calls[0][0].headerRight();
    const {getByA11yHint} = render(headerRight);
    const dotsButton = getByA11yHint('dots-image');
    await act(async () => {
      fireEvent.press(dotsButton);
    });
    const {getByText} = render(
      <Provider store={store}>
        <AlertNotificationRoot>
          <ProfileMoreOptionsModal visible={true} onClose={() => {}} />
        </AlertNotificationRoot>
      </Provider>,
    );
    const modal = await waitFor(() => getByText('Delete Account'));
    expect(modal).toBeTruthy();
  });
  it('calls onClose when bin is pressed', async () => {
    const {queryByText} = render(<TestWrapper />);

    const binButton = screen.getByA11yHint('bin-image');

    await act(async () => {
      fireEvent.press(binButton);
    });

    await waitFor(() => {
      expect(queryByText('Delete Account')).toBeNull();
    });
  });

  it('renders profile picture when userData.profilePicture is present', async () => {
    const mockUser = {
      firstName: 'Anoosha',
      lastName: 'Sanugula',
      email: 'anu@gmail.com',
      phoneNumber: '1234567890',
      profilePicture: 'profile.jpg',
      isDeleted: false,
    };

    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(mockUser),
    );

    await waitFor(() => {
      renderComponent();
    });

    await waitFor(() => {
      expect(
        screen.getByAccessibilityHint('profile-image').props.source.uri,
      ).toBe(mockUser.profilePicture);
    });
  });
  it('shows default image when profile picture is null', async () => {
    const mockUser = {
      firstName: 'Anoosha',
      lastName: 'Sanugula',
      email: 'anu@gmail.com',
      phoneNumber: '1234567890',
      profilePicture: null,
      isDeleted: false,
    };

    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(mockUser),
    );

    const {getByA11yHint} = renderComponent();
    const profileImage = await waitFor(() => getByA11yHint('profile-image'));

    expect(profileImage.props.source.uri).toBe(DEFAULT_PROFILE_IMAGE);
  });
  it('does not render email field when email is not present', async () => {
    const mockUser = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: '',
      phoneNumber: '1234567890',
      profilePicture: null,
      isDeleted: false,
    };

    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(mockUser),
    );

    const {queryByText} = renderComponent();
    await waitFor(() => {
      expect(queryByText('Email')).toBeNull();
    });
  });
});
