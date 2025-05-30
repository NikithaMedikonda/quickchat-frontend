import {NavigationContainer} from '@react-navigation/native';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {Provider} from 'react-redux';
import {deleteChat} from '../../services/DeleteChat';
import {blockUser} from '../../services/UserBlock';
import {unblockUser} from '../../services/UserUnblock';
import {store} from '../../store/store';
import {ChatOptionsModal} from './ChatOptionsModal';

jest.mock('../../themes/colors', () => ({
  useThemeColors: () => ({
    background: 'white',
    text: 'black',
  }),
}));

jest.mock('../../themes/images', () => ({
  useImagesColors: () => ({
    bin: {testUri: 'bin-icon'},
    chatblockImage: {testUri: 'chatblock-icon'},
  }),
}));
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));
jest.mock('../../services/UserBlock', () => ({
  blockUser: jest.fn(() => Promise.resolve({status: 200})),
}));

jest.mock('../../services/UserUnblock', () => ({
  unblockUser: jest.fn(() => Promise.resolve({status: 200})),
}));
jest.mock('../../services/DeleteChat', () => ({
  deleteChat: jest.fn(() => Promise.resolve({status: 200})),
}));

const mockReplace = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNavigationModule = jest.requireActual('@react-navigation/native');
  return {
    ...actualNavigationModule,
    useNavigation: () => ({
      replace: mockReplace,
    }),
  };
});

(EncryptedStorage.getItem as jest.Mock).mockImplementation(key => {
  if (key === 'user') {
    return Promise.resolve(JSON.stringify({phoneNumber: '1234567890'}));
  }
  if (key === 'authToken') {
    return Promise.resolve('mocked_token');
  }
  return Promise.resolve(null);
});

describe('ChatOptionsModal', () => {
  const mockOnClose = jest.fn();

  const renderComponent = (visible = true) =>
    render(
      <Provider store={store}>
        <NavigationContainer>
          <ChatOptionsModal
            visible={visible}
            onClose={mockOnClose}
            isUserBlocked={false}
            setIsCleared={jest.fn()}
          />
        </NavigationContainer>
      </Provider>,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('renders Block User and Delete Chat options with correct icons', () => {
    renderComponent();
    expect(screen.getByText('Block User')).toBeTruthy();
    expect(screen.getByText('Delete Chat')).toBeTruthy();
    expect(screen.getByA11yHint('block-user-icon').props.source).toEqual({
      testUri: 'chatblock-icon',
    });
    expect(screen.getByA11yHint('delete-chat-icon').props.source).toEqual({
      testUri: 'bin-icon',
    });
  });

  it('calls blockUser and onBlockStatusChange(true) when confirming block', async () => {
    const mockOnBlockStatusChange = jest.fn();

    render(
      <Provider store={store}>
        <NavigationContainer>
          <ChatOptionsModal
            visible={true}
            onClose={mockOnClose}
            isUserBlocked={false}
            onBlockStatusChange={mockOnBlockStatusChange}
            setIsCleared={jest.fn()}
          />
        </NavigationContainer>
      </Provider>,
    );

    fireEvent.press(screen.getByText('Block User'));
    const confirmButton = await screen.findByText('Block');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(blockUser).toHaveBeenCalledWith({
        blockerPhoneNumber: '1234567890',
        blockedPhoneNumber: '',
        authToken: 'mocked_token',
      });
      expect(mockOnBlockStatusChange).toHaveBeenCalledWith(true);
    });
  });

  it('calls unblockUser and onBlockStatusChange(true) when confirming unblock', async () => {
    const mockOnBlockStatusChange = jest.fn();

    render(
      <Provider store={store}>
        <NavigationContainer>
          <ChatOptionsModal
            visible={true}
            onClose={mockOnClose}
            isUserBlocked={true}
            onBlockStatusChange={mockOnBlockStatusChange}
            setIsCleared={jest.fn()}
          />
        </NavigationContainer>
      </Provider>,
    );

    fireEvent.press(screen.getByText('Unblock User'));
    const confirmButton = await screen.findByText('Unblock');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(unblockUser).toHaveBeenCalledWith({
        blockerPhoneNumber: '1234567890',
        blockedPhoneNumber: '',
        authToken: 'mocked_token',
      });
      expect(mockOnBlockStatusChange).toHaveBeenCalledWith(false);
    });
  });

  it('should check if any error occur while getting block status', async () => {
    const mockOnBlockStatusChange = jest.fn();
    (unblockUser as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(
      <Provider store={store}>
        <NavigationContainer>
          <ChatOptionsModal
            visible={true}
            onClose={mockOnClose}
            isUserBlocked={true}
            onBlockStatusChange={mockOnBlockStatusChange}
            setIsCleared={jest.fn()}
          />
        </NavigationContainer>
      </Provider>,
    );

    fireEvent.press(screen.getByText('Unblock User'));
    const confirmButton = await screen.findByText('Unblock');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertMessage).toBe(
        'Unable to block or unblock the user',
      );
      expect(state.registration.alertType).toBe('info');
    });
  });

  it('calls onClose when tapping outside modal', async () => {
    renderComponent();

    const background = screen.getByLabelText('modal-background');
    fireEvent.press(background);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('opens block confirmation modal when "Block User" is pressed', async () => {
    renderComponent();
    fireEvent.press(screen.getByText('Block User'));

    await waitFor(() => {
      expect(
        screen.getByText('Are you sure you want to block this user?'),
      ).toBeTruthy();
      expect(screen.getByText('Block')).toBeTruthy();
    });
  });

  it('opens delete confirmation modal when "Delete Chat" is pressed', async () => {
    renderComponent();
    fireEvent.press(screen.getByText('Delete Chat'));

    await waitFor(() => {
      expect(
        screen.getByText('Are you sure you want to delete this chat?'),
      ).toBeTruthy();
      expect(screen.getByText('Delete')).toBeTruthy();
    });
  });

  it('closes confirmation modal after confirming "Delete"', async () => {
    renderComponent();
    fireEvent.press(screen.getByText('Delete Chat'));
    const confirmButton = await screen.findByText('Delete');
    fireEvent.press(confirmButton);
    await waitFor(() => {
      expect(
        screen.queryByText('Are you sure you want to delete this chat?'),
      ).toBeNull();
    });
  });

  it('closes confirmation modal when cancel is pressed', async () => {
    renderComponent();
    fireEvent.press(screen.getByText('Block User'));
    const cancelButton = await screen.findByText('Cancel');
    fireEvent.press(cancelButton);

    await waitFor(() => {
      expect(
        screen.queryByText('Are you sure you want to block this user?'),
      ).toBeNull();
    });
  });

  it('closes confirmation modal after confirming "Block"', async () => {
    renderComponent();
    fireEvent.press(screen.getByText('Block User'));
    const confirmButton = await screen.findByText('Block');
    fireEvent.press(confirmButton);
    await waitFor(() => {
      expect(
        screen.queryByText('Are you sure you want to block this user?'),
      ).toBeNull();
    });
  });


  it('calls deleteChat and shows success alert on confirm delete', async () => {
    renderComponent();
    fireEvent.press(screen.getByText('Delete Chat'));
    const confirmButton = await screen.findByText('Delete');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(deleteChat).toHaveBeenCalled();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertMessage).toBe(
        'Chat deleted successfully.',
      );
      expect(state.registration.alertType).toBe('success');
      expect(mockReplace).toHaveBeenCalledWith('hometabs');
    });
  });

  it('shows alert on error during delete chat', async () => {
    (deleteChat as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    renderComponent();
    fireEvent.press(screen.getByText('Delete Chat'));
    const confirmButton = await screen.findByText('Delete');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertMessage).toBe('Unable to delete the chat');
      expect(state.registration.alertType).toBe('info');
    });
  });

  it('shows warning alert if deleteChat response status is not 200', async () => {
    (deleteChat as jest.Mock).mockResolvedValueOnce({status: 500});

    renderComponent();
    fireEvent.press(screen.getByText('Delete Chat'));
    const confirmButton = await screen.findByText('Delete');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertTitle).toBe('Failed');
      expect(state.registration.alertMessage).toBe(
        'Failed to delete the chat.',
      );
      expect(state.registration.alertType).toBe('warning');
    });
  });

  it('shows alert on network error during block/unblock', async () => {
    const mockOnBlockStatusChange = jest.fn();

    (blockUser as jest.Mock).mockRejectedValueOnce(
      new TypeError('Network request failed'),
    );

    render(
      <Provider store={store}>
        <NavigationContainer>
          <ChatOptionsModal
            visible={true}
            onClose={mockOnClose}
            isUserBlocked={false}
            onBlockStatusChange={mockOnBlockStatusChange}
            setIsCleared={jest.fn()}
          />
        </NavigationContainer>
      </Provider>,
    );

    fireEvent.press(screen.getByText('Block User'));
    const confirmButton = await screen.findByText('Block');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertMessage).toBe(
        'Unable to block or unblock the user',
      );
      expect(state.registration.alertType).toBe('info');
    });
  });
});
