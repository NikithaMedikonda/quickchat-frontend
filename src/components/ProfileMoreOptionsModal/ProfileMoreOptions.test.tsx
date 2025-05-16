import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react-native';
import {Alert} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {Provider} from 'react-redux';
import {deleteUser} from '../../services/DeleteUser';
import {ProfileMoreOptionsModal} from './ProfileMoreOptionsModal';
import {store} from '../../store/store';

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

jest.spyOn(Alert, 'alert');

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
  it('should renders the delete account text and bin image', () => {
    renderComponent();
    expect(screen.getByText('Delete Account')).toBeTruthy();
    const binImage = screen.getByA11yHint('bin-image');
    expect(binImage.props.source).toEqual({
      testUri: '../../../src/assets/bin.png',
    });
  });

  it('should renders the logout text and logout image', () => {
    renderComponent();
    expect(screen.getByText('Logout')).toBeTruthy();
    const logoutImage = screen.getByA11yHint('logout-image');
    expect(logoutImage.props.source).toEqual({
      testUri: '../../../src/assets/log-out.png',
    });
  });

  it('should renders the edit profile text and edit image', () => {
    renderComponent();
    expect(screen.getByText('Edit Profile')).toBeTruthy();
    const binImage = screen.getByA11yHint('edit-image');
    expect(binImage.props.source).toEqual({
      testUri: '../../../src/assets/edit.png',
    });
  });
  it('should calls onClose when "Delete Account" is pressed', () => {
    renderComponent();
    fireEvent.press(screen.getByText('Delete Account'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should calls onClose when "Logout" is pressed', () => {
    renderComponent();
    fireEvent.press(screen.getByText('Logout'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should calls onClose when "Edit Profile" is pressed', () => {
    renderComponent();
    fireEvent.press(screen.getByText('Edit Profile'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('opens and confirms logout modal', async () => {
    renderComponent();
    fireEvent.press(screen.getAllByText('Logout')[0]);
    expect(mockOnClose).toHaveBeenCalled();
    const confirmModalText = await screen.findByText(
      'Are you sure want to logout from this device?',
    );
    const confirmModal = confirmModalText.parent?.parent;
    const confirmButton = within(confirmModal!).getByText('Logout');
    fireEvent.press(confirmButton);
    await waitFor(() => {
      expect(EncryptedStorage.clear).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('login');
    });
  });

  it('opens and confirms delete modal (200)', async () => {
    (deleteUser as jest.Mock).mockResolvedValue({status: 200, data: {}});
    renderComponent();
    fireEvent.press(screen.getByText('Delete Account'));
    expect(mockOnClose).toHaveBeenCalled();
    const confirmButton = await screen.findByText('Delete');
    fireEvent.press(confirmButton);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('welcome');
    });
  });

  it('handles delete error responses (404, 412, 401, 403)', async () => {
    const responses = [
      {status: 404, expected: 'Invalid Phone number'},
      {status: 412, expected: 'Invalid secret key'},
      {status: 401, expected: 'Invalid token'},
      {status: 403, expected: 'Authentication failed'},
      {status: 500, expected: 'Something went wrong while deleting'},
    ];
    for (const {status, expected} of responses) {
      (deleteUser as jest.Mock).mockResolvedValue({status});
      renderComponent();
      fireEvent.press(screen.getByText('Delete Account'));
      const confirmButton = await screen.findByText('Delete');
      fireEvent.press(confirmButton);
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(expected);
      });
    }
  });

  it('handles delete exception (network or unknown error)', async () => {
    (deleteUser as jest.Mock).mockRejectedValueOnce(new Error('Custom error'));
    renderComponent();
    fireEvent.press(screen.getByText('Delete Account'));
    const confirmButton = await screen.findByText('Delete');
    fireEvent.press(confirmButton);
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Custom error');
    });
  });

  it('closes modal on cancel', async () => {
    renderComponent();
    fireEvent.press(screen.getAllByText('Logout')[0]);

    const closeButton = await screen.findAllByText('Logout');
    fireEvent.press(closeButton[0]);
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('loads user phone number and auth token from AsyncStorage on mount', async () => {
    renderComponent();
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

  it('should trigger useEffect and call AsyncStorage.getItem with correct keys', async () => {
    renderComponent();
    await waitFor(() => {
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith('user');
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith('authToken');
    });
  });

  it('should handle error and alert the message if deleteUser throws', async () => {
    const errorMessage = 'Network error';
    (deleteUser as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
    renderComponent();
    fireEvent.press(screen.getByText('Delete Account'));
    const confirmButton = await screen.findByText('Delete');
    fireEvent.press(confirmButton);
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(errorMessage);
    });
  });
});
