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

jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(),
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

describe('Profile Screen', () => {
  beforeEach(() => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(mockUserData),
    );
  });
  const renderComponent = () =>
    render(
      <Provider store={store}>
        <Profile />
      </Provider>,
    );
  it('renders the dot image', async() => {
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
        <ProfileMoreOptionsModal visible={true} onClose={() => {}} />
      </Provider>,
    );
    const modal = await waitFor(() => getByText('Delete Account'));
    expect(modal).toBeTruthy();
  });
  it('calls onClose when bin is pressed', async () => {
    const onClose = jest.fn();
    render(
      <Provider store={store}>
        <ProfileMoreOptionsModal visible={true} onClose={onClose} />
      </Provider>,
    );
    const binButton = screen.getByA11yHint('bin-image');
    await act(async () => {
      fireEvent.press(binButton);
    });
    expect(onClose).toHaveBeenCalled();
  });
});
