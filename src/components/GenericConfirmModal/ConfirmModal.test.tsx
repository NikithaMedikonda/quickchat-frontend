import {render, fireEvent} from '@testing-library/react-native';
import {ConfirmModal} from './ConfirmModal';

describe('ConfirmModal renders and behaves correctly', () => {
  const mockOnConfirm = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    visible: true,
    message: 'Are you sure?',
    confirmText: 'Confirm',
    onConfirm: mockOnConfirm,
    onClose: mockOnClose,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Should renders the modal with message and buttons', () => {
    const {getByText} = render(<ConfirmModal {...defaultProps} />);
    expect(getByText('Are you sure?')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
    expect(getByText('Confirm')).toBeTruthy();
  });

  test('Should calls setVisible(false) when "Cancel" is pressed', () => {
    const {getByText} = render(<ConfirmModal {...defaultProps} />);
    fireEvent.press(getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('Should calls onConfirm when "Confirm" is pressed', () => {
    const {getByText} = render(<ConfirmModal {...defaultProps} />);
    fireEvent.press(getByText('Confirm'));
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  test('Should uses default confirmText "Yes" if not provided', () => {
    const {getByText} = render(
      <ConfirmModal {...defaultProps} confirmText={undefined} />,
    );
    expect(getByText('Yes')).toBeTruthy();
  });

  test('Should does not render the modal when visible is false', () => {
    const {queryByText} = render(
      <ConfirmModal {...defaultProps} visible={false} />,
    );
    expect(queryByText('Are you sure?')).toBeNull();
    expect(queryByText('Cancel')).toBeNull();
    expect(queryByText('Confirm')).toBeNull();
  });

  test('Should renders the modal when visible is true', () => {
    const {getByText} = render(
      <ConfirmModal {...defaultProps} visible={true} />,
    );
    expect(getByText('Are you sure?')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
    expect(getByText('Confirm')).toBeTruthy();
  });
});
