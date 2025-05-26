import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {Provider} from 'react-redux';
import {deleteUser} from '../../services/DeleteUser';
import {store} from '../../store/store';
import {ProfileMoreOptionsModal} from './ProfileMoreOptionsModal';

const mockReplace = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    replace: mockReplace,
  }),
}));

jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(),
  clear: jest.fn(),
  getItem: jest.fn(key => {
    if (key === 'user') {
      return Promise.resolve(JSON.stringify({phoneNumber: '1234567890'}));
    }
    if (key === 'authToken') {
      return Promise.resolve('1221');
    }
    return Promise.resolve(null);
  }),
}));

jest.mock('../../services/DeleteUser', () => ({
  deleteUser: jest.fn(),
}));

jest.useFakeTimers();

describe('Profile More Options Modal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <ProfileMoreOptionsModal visible={true} onClose={mockOnClose} />
      </Provider>,
    );
  it('should renders the delete account text and bin image', async () => {
    await waitFor(() => {
      renderComponent();
    });
    expect(screen.getByText('Delete Account')).toBeTruthy();
    const binImage = screen.getByA11yHint('bin-image');
    expect(binImage.props.source).toEqual({
      testUri: '../../../src/assets/BinLight.png',
    });
  });

  it('should renders the logout text and logout image', async () => {
    await waitFor(() => {
      renderComponent();
    });
    expect(screen.getByText('Logout')).toBeTruthy();
    const logoutImage = screen.getByA11yHint('logout-image');
    expect(logoutImage.props.source).toEqual({
      testUri: '../../../src/assets/LogOutLight.png',
    });
  });

  it('should renders the edit profile text and edit image', async () => {
    await waitFor(() => {
      renderComponent();
    });
    expect(screen.getByText('Edit Profile')).toBeTruthy();
    const binImage = screen.getByA11yHint('edit-image');
    expect(binImage.props.source).toEqual({
      testUri: '../../../src/assets/PencilLight.png',
    });
  });

  it('should calls onClose when "Delete Account" is pressed', async () => {
    await waitFor(() => {
      renderComponent();
    });
    fireEvent.press(screen.getByText('Delete Account'));
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should calls onClose when "Logout" is pressed', async () => {
    await waitFor(() => {
      renderComponent();
    });
    fireEvent.press(screen.getByText('Logout'));
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should calls onClose when "Edit Profile" is pressed', async () => {
    await waitFor(() => {
      renderComponent();
    });
    fireEvent.press(screen.getByText('Edit Profile'));
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('opens and confirms logout modal', async () => {
    await waitFor(() => {
      renderComponent();
    });
    fireEvent.press(screen.getAllByText('Logout')[0]);
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
    const confirmModalText = await screen.findByText(
      'Are you sure want to logout from this device?',
    );
    const confirmModal = confirmModalText.parent?.parent;
    const confirmButton = within(confirmModal!).getByText('Logout');
    fireEvent.press(confirmButton);
    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertType).toBe('success');
      expect(state.registration.alertMessage).toBe('Successfully logout');
    });

    await waitFor(() => {
      jest.advanceTimersByTime(1000);
      expect(mockReplace).toHaveBeenCalledWith('login');
    });
  });

  it('opens and confirms delete modal (200)', async () => {
    (deleteUser as jest.Mock).mockResolvedValue({status: 200, data: {}});
    await waitFor(() => {
      renderComponent();
    });
    fireEvent.press(screen.getByText('Delete Account'));
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
    const confirmButton = await screen.findByText('Delete');
    fireEvent.press(confirmButton);
    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertType).toBe('success');
      expect(state.registration.alertMessage).toBe(
        'Successfully deleted account',
      );
    });

    await waitFor(() => {
      jest.advanceTimersByTime(1000);
      expect(mockReplace).toHaveBeenCalledWith('welcome');
    });
  });

  it('handles delete error responses (404, 412, 401, 403)', async () => {
    const responses = [
      {status: 404},
      {status: 412},
      {status: 401},
      {status: 403},
      {status: 500},
    ];
    for (const {status} of responses) {
      (deleteUser as jest.Mock).mockResolvedValue({status});
      await waitFor(() => {
        renderComponent();
      });
      fireEvent.press(screen.getByText('Delete Account'));
      const confirmButton = await screen.findByText('Delete');
      fireEvent.press(confirmButton);
      await waitFor(() => {
        const state = store.getState();
        expect(state.registration.alertMessage).toBe('Something went wrong');
        expect(state.registration.alertType).toBe('warning');
      });
    }
  });

  it('handles delete exception (network or unknown error)', async () => {
    (deleteUser as jest.Mock).mockRejectedValueOnce(new Error('Custom error'));
    await waitFor(() => {
      renderComponent();
    });
    fireEvent.press(screen.getByText('Delete Account'));
    const confirmButton = await screen.findByText('Delete');
    fireEvent.press(confirmButton);
    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertMessage).toBe('Network error');
      expect(state.registration.alertType).toBe('info');
    });
  });

  it('closes modal on cancel', async () => {
    await waitFor(() => {
      renderComponent();
    });
    fireEvent.press(screen.getAllByText('Logout')[0]);

    const closeButton = await screen.findAllByText('Logout');
    fireEvent.press(closeButton[0]);
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('loads user phone number and auth token from EncryptedStorage on mount', async () => {
    await waitFor(() => {
      renderComponent();
    });
    await waitFor(() => {
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith('user');
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith('authToken');
    });
    fireEvent.press(screen.getByText('Delete Account'));
    const confirmButton = await screen.findByText('Delete');
    fireEvent.press(confirmButton);
    await waitFor(() => {
      expect(deleteUser).toHaveBeenCalledWith({
        phoneNumber: '1234567890',
        authToken: '1221',
      });
    });
  });

  it('should trigger useEffect and call EncryptedStorage.getItem with correct keys', async () => {
    await waitFor(() => {
      renderComponent();
    });
    await waitFor(() => {
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith('user');
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith('authToken');
    });
  });

  it('should handle error and alert the message if deleteUser throws', async () => {
    const errorMessage = 'Network error';
    (deleteUser as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
    await waitFor(() => {
      renderComponent();
    });
    fireEvent.press(screen.getByText('Delete Account'));
    const confirmButton = await screen.findByText('Delete');
    fireEvent.press(confirmButton);
    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertMessage).toBe('Network error');
      expect(state.registration.alertType).toBe('info');
    });
  });
});
