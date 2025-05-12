import {render, screen, waitFor} from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Profile} from './Profile';

jest.mock('@react-native-async-storage/async-storage', () => ({
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
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(mockUserData),
    );
  });
  it('renders the dot image', () => {
    render(<Profile />);
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
    render(<Profile />);
    const profileImage = await waitFor(() =>
      screen.getByA11yHint('profile-image'),
    );
    expect(profileImage).toBeTruthy();
  });

  it('renders the first name section correctly', async () => {
    render(<Profile />);
    expect(await screen.findByText('First Name')).toBeTruthy();
    expect(await screen.findByText(mockUserData.firstName)).toBeTruthy();
  });

  it('renders the last name section correctly', async () => {
    render(<Profile />);
    expect(await screen.findByText('Last Name')).toBeTruthy();
    expect(await screen.findByText(mockUserData.lastName)).toBeTruthy();
  });

  it('renders the email section correctly', async () => {
    render(<Profile />);
    expect(await screen.findByText('Email')).toBeTruthy();
    expect(await screen.findByText(mockUserData.email)).toBeTruthy();
  });

  it('renders the phone number section correctly', async () => {
    render(<Profile />);
    expect(await screen.findByText('Phone Number')).toBeTruthy();
    expect(await screen.findByText(mockUserData.phoneNumber)).toBeTruthy();
  });
  it('loads user data from AsyncStorage and displays profile image', async () => {
    const mockUser = {
      profilePicture: 'https://example.com/profile.jpg',
      firstName: 'Anoosha',
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(mockUser),
    );

    const {getByA11yHint} = render(<Profile />);
    const image = await waitFor(() => getByA11yHint('profile-image'));

    expect(image).toBeTruthy();
  });
});
