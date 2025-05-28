import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {Provider} from 'react-redux';
import {updateProfile} from '../../services/UpdateProfile';
import {store} from '../../store/store';
import {resetForm} from '../../store/slices/registrationSlice';
import {EditProfile} from './EditProfile';
import {BackButton} from './EditProfile';
import { useImagesColors } from '../../themes/images';

jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../services/UpdateProfile', () => ({
  updateProfile: jest.fn(),
}));

jest.mock('../../components/ImagePickerModal/ImagePickerModal', () => ({
  ImagePickerModal: () => <></>,
}));

const mockNavigation = {
  setOptions: jest.fn(),
  replace: jest.fn(),
  navigate: jest.fn(),
};
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => mockNavigation,
  };
});

describe('EditProfile Component', () => {
  const {androidBackArrow, iOSBackArrow} = useImagesColors();
  beforeEach(() => {
    jest.clearAllMocks();
    store.dispatch(resetForm());
    jest.spyOn(console, 'error').mockImplementation(() => {});

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

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('renders the profile image and input fields', async () => {
    const {getByText, getByAccessibilityHint} = render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => {
      expect(getByAccessibilityHint('Profile-Picture')).toBeTruthy();
    });

    await waitFor(() => {
      expect(getByText('First Name')).toBeTruthy();
      expect(getByText('Last Name')).toBeTruthy();
      expect(getByText('Email')).toBeTruthy();
      expect(getByText('Save')).toBeTruthy();
    });
  });

  test('shows error when trying to save with empty inputs', async () => {
    const {getByText, getByDisplayValue} = render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => getByText('Save'));

    fireEvent.changeText(getByDisplayValue('test'), '');
    fireEvent.changeText(getByDisplayValue('user'), '');
    fireEvent.changeText(
      getByDisplayValue('testuser@gmail.com'),
      'testuser@gmail.com',
    );

    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(getByText('First name required!')).toBeTruthy();
      expect(getByText('Last name required!')).toBeTruthy();
    });
  });

  test('shows alert for invalid email format', async () => {
    const {getByText, getByDisplayValue} = render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );
    await waitFor(() => getByText('Save'));

    fireEvent.changeText(getByDisplayValue('test'), 'test1');
    fireEvent.changeText(getByDisplayValue('user'), 'user1');
    fireEvent.changeText(
      getByDisplayValue('testuser@gmail.com'),
      'invalid@email.',
    );

    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(getByText('Invalid email format!')).toBeTruthy();
    });
  });

  test('shows alert for invalid last name', async () => {
    const {getByText, getByDisplayValue} = render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );
    await waitFor(() => getByText('Save'));

    fireEvent.changeText(getByDisplayValue('test'), 'test1');
    fireEvent.changeText(getByDisplayValue('user'), '');
    fireEvent.changeText(
      getByDisplayValue('testuser@gmail.com'),
      'testuser@gmail.com',
    );

    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(getByText('Last name required!')).toBeTruthy();
    });
  });

  test('opens image picker modal when profile image is pressed', async () => {
    const {getByAccessibilityHint} = render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => {
      const profileButton = getByAccessibilityHint('edit-profile-button');
      fireEvent.press(profileButton);
    });

    const state = store.getState();
    await waitFor(() => {
      expect(state.registration.isVisible).toBe(true);
    });
  });

  test('shows specific error for status 400 (phone number required)', async () => {
    (updateProfile as jest.Mock).mockResolvedValue({
      status: 400,
      data: {},
    });

    const {getByText, getByDisplayValue} = render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => getByText('Save'));

    fireEvent.changeText(getByDisplayValue('test'), 'test1');
    fireEvent.changeText(getByDisplayValue('user'), 'user1');
    fireEvent.changeText(
      getByDisplayValue('testuser@gmail.com'),
      'testuser@gmail.com',
    );

    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertMessage).toBe(
        'Phone Number is required to change the profile image.',
      );
      expect(state.registration.alertType).toBe('error');
    });
  });

  test('calls editProfile and navigates on successful save', async () => {
    (updateProfile as jest.Mock).mockResolvedValue({
      status: 200,
      data: {
        user: {
          firstName: 'test',
          lastName: 'user',
          email: 'testuser@gmail.com',
          phoneNumber: '1234567890',
          profilePicture: 'somerandomsupabaseurl.com',
        },
      },
    });

    const {getByText, getByDisplayValue} = render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );
    await waitFor(() => getByText('Save'));

    fireEvent.changeText(getByDisplayValue('test'), 'test1');
    fireEvent.changeText(getByDisplayValue('user'), 'user1');
    fireEvent.changeText(
      getByDisplayValue('testuser@gmail.com'),
      'testuser1@gmail.com',
    );

    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith(
        {
          phoneNumber: '1234567890',
          image: '',
          firstName: 'test1',
          lastName: 'user1',
          email: 'testuser1@gmail.com',
          token: 'mock-token',
        },
        expect.any(Object),
      );
      expect(EncryptedStorage.setItem).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockNavigation.replace).toHaveBeenCalledWith('profileScreen');
    });
  });

  test('shows error alert on editProfile failure', async () => {
    (updateProfile as jest.Mock).mockRejectedValue(new Error('Network error'));

    const {getByText, getByDisplayValue} = render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => getByText('Save'));

    fireEvent.changeText(getByDisplayValue('test'), 'test1');
    fireEvent.changeText(getByDisplayValue('user'), 'user1');
    fireEvent.changeText(
      getByDisplayValue('testuser@gmail.com'),
      'test1@example.com',
    );

    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertType).toBe('error');
    });
  });

  test('shows specific error for status 404 (user not found)', async () => {
    (updateProfile as jest.Mock).mockResolvedValue({
      status: 404,
      data: {},
    });

    const {getByText, getByDisplayValue} = render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => getByText('Save'));

    fireEvent.changeText(getByDisplayValue('test'), 'test1');
    fireEvent.changeText(getByDisplayValue('user'), 'user1');
    fireEvent.changeText(
      getByDisplayValue('testuser@gmail.com'),
      'test1@example.com',
    );

    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertMessage).toBe(
        'No user exists with the given phone number.',
      );
      expect(state.registration.alertType).toBe('error');
    });
  });

  test('shows error for empty first name', async () => {
    const {getByText, getByDisplayValue} = render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => getByText('Save'));

    fireEvent.changeText(getByDisplayValue('test'), '');
    fireEvent.changeText(getByDisplayValue('user'), 'user1');
    fireEvent.changeText(
      getByDisplayValue('testuser@gmail.com'),
      'testuser1@gmail.com',
    );

    fireEvent.press(getByText('Save'));
    await waitFor(() => {
      expect(getByText('First name required!')).toBeTruthy();
    });
  });

  test('sets correct navigation header options', async () => {
    render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => {
      expect(mockNavigation.setOptions).toHaveBeenCalledWith({
        headerTitleAlign: 'center',
        headerTitle: 'Edit Profile',
        headerLeft: expect.any(Function),
      });
    });
  });

  test('shows error when user data is not loaded', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(key => {
      if (key === 'authToken') {
        return Promise.reject(new Error('Failed to load'));
      }
    });
    render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );
    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertMessage).toBe('Something went wrong');
      expect(state.registration.alertType).toBe('error');
    });
  });

  test('loads user data successfully and populates the store', async () => {
    const mockUser = {
      firstName: 'test',
      lastName: 'user',
      email: 'testuser@gmail.com',
      phoneNumber: '1234567890',
    };
    const mockToken = 'mocked-access-token';

    (EncryptedStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => {
        if (key === 'user') {
          return Promise.resolve(JSON.stringify(mockUser));
        }
        if (key === 'authToken') {
          return Promise.resolve(mockToken);
        }
        return Promise.resolve(null);
      },
    );

    render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.editProfileForm.firstName).toBe('test');
      expect(state.registration.editProfileForm.lastName).toBe('user');
      expect(state.registration.editProfileForm.email).toBe(
        'testuser@gmail.com',
      );
      expect(state.registration.editProfileForm.phoneNumber).toBe('1234567890');
      expect(state.registration.editProfileForm.token).toBe(
        'mocked-access-token',
      );
    });
  });

  test('handles user data with undefined fields gracefully', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(key => {
      if (key === 'user') {
        return Promise.resolve(
          JSON.stringify({
            firstName: undefined,
            lastName: null,
            email: 'test@example.com',
            phoneNumber: undefined,
          }),
        );
      }
      if (key === 'authToken') {
        return Promise.resolve('mock-token');
      }
      return Promise.resolve(null);
    });

    render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.editProfileForm.firstName).toBe('');
      expect(state.registration.editProfileForm.lastName).toBe('');
      expect(state.registration.editProfileForm.email).toBe('test@example.com');
      expect(state.registration.editProfileForm.phoneNumber).toBe('');
    });
  });

  test('handles null user data from storage', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(key => {
      if (key === 'user') {
        return Promise.resolve(null);
      }
      if (key === 'authToken') {
        return Promise.resolve('mock-token');
      }
      return Promise.resolve(null);
    });

    render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.editProfileForm.firstName).toBe('');
      expect(state.registration.editProfileForm.lastName).toBe('');
      expect(state.registration.editProfileForm.email).toBe('');
      expect(state.registration.editProfileForm.phoneNumber).toBe('');
    });
  });

  test('handles empty auth token', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(key => {
      if (key === 'user') {
        return Promise.resolve(
          JSON.stringify({
            firstName: 'test',
            lastName: 'user',
            email: 'test@example.com',
            phoneNumber: '1234567890',
          }),
        );
      }
      if (key === 'authToken') {
        return Promise.resolve('');
      }
      return Promise.resolve(null);
    });

    render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.editProfileForm.token).toBe('');
    });
  });

  test('handles null auth token', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(key => {
      if (key === 'user') {
        return Promise.resolve(
          JSON.stringify({
            firstName: 'test',
            lastName: 'user',
            email: 'test@example.com',
            phoneNumber: '1234567890',
          }),
        );
      }
      if (key === 'authToken') {
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    });

    render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.editProfileForm.token).toBe('');
    });
  });

  test('displays profile image correctly with different image sources', async () => {
    const {getByAccessibilityHint} = render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => {
      const profileImage = getByAccessibilityHint('Profile-Picture');
      expect(profileImage).toBeTruthy();
    });
  });

  test('renders all input fields correctly', async () => {
    const {getByText} = render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => {
      expect(getByText('First Name')).toBeTruthy();
      expect(getByText('Last Name')).toBeTruthy();
      expect(getByText('Email')).toBeTruthy();
    });
  });

  test('navigates to profile screen after successful update with timeout', async () => {
    jest.useFakeTimers();

    (updateProfile as jest.Mock).mockResolvedValue({
      status: 200,
      data: {
        user: {
          firstName: 'test',
          lastName: 'user',
          email: 'testuser@gmail.com',
          phoneNumber: '1234567890',
        },
      },
    });

    const {getByText, getByDisplayValue} = render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => getByText('Save'));

    fireEvent.changeText(getByDisplayValue('test'), 'test1');
    fireEvent.changeText(getByDisplayValue('user'), 'user1');
    fireEvent.changeText(
      getByDisplayValue('testuser@gmail.com'),
      'testuser1@gmail.com',
    );

    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertType).toBe('success');
      jest.advanceTimersByTime(1000);
      expect(mockNavigation.replace).toHaveBeenCalledWith('profileScreen');
      jest.useRealTimers();
    });
  });

  test('handles invalid JSON in stored user data', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockImplementation(key => {
      if (key === 'user') {
        return Promise.resolve('invalid-json-string');
      }
      if (key === 'authToken') {
        return Promise.resolve('mock-token');
      }
      return Promise.resolve(null);
    });

    render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertMessage).toBe('Something went wrong');
      expect(state.registration.alertType).toBe('error');
    });
  });

  test('handles unexpected status codes from updateProfile', async () => {
    (updateProfile as jest.Mock).mockResolvedValue({
      status: 500,
      data: {},
    });
    const {getByText, getByDisplayValue} = render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => getByText('Save'));
    fireEvent.changeText(getByDisplayValue('test'), 'test');
    fireEvent.changeText(getByDisplayValue('user'), 'user');
    fireEvent.changeText(
      getByDisplayValue('testuser@gmail.com'),
      'test@example.com',
    );
    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalled();
    });
  });

 test('Save button is disabled when no form changes are made', async () => {
  const {getByA11yHint} = render(
    <Provider store={store}>
      <EditProfile />
    </Provider>,
  );
 const saveButton = await waitFor(() => getByA11yHint('Save-button'));
expect(saveButton.props.accessibilityState.disabled).toBe(true);

});
test('should goback when tapped on goback arrow', async () => {
  render(
    <Provider store={store}>
      <EditProfile />
    </Provider>,
  );
      const HeaderLeftComponent =
        mockNavigation.setOptions.mock.calls[0][0].headerLeft();
      render(<>{HeaderLeftComponent}</>);
      const image = screen.getByA11yHint('back-arrow-image');
      fireEvent.press(image);
      expect(mockNavigation.navigate).toHaveBeenCalled();
    });
  });

