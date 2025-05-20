import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import {Provider} from 'react-redux';
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

describe('ChatOptionsModal', () => {
  const mockOnClose = jest.fn();

  const renderComponent = (visible = true) =>
    render(
      <Provider store={store}>
        <ChatOptionsModal visible={visible} onClose={mockOnClose} />
      </Provider>,
    );

  beforeEach(() => {
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
});
