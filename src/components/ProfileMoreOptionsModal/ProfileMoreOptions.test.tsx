import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {ProfileMoreOptionsModal} from './ProfileMoreOptionsModal';
import {Provider} from 'react-redux';
import {store} from '../../store/store';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    replace: mockNavigate,
  }),
}));

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
});
