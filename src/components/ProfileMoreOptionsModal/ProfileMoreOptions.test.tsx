import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {ProfileMoreOptionsModal} from './ProfileMoreOptionsModal';

describe('Profile More Optiions Modal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should renders the delete account text and bin image', () => {
    const {getByText} = render(
      <ProfileMoreOptionsModal visible={true} onClose={() => {}} />,
    );
    expect(getByText('Delete Account')).toBeTruthy();
    const binImage = screen.getByA11yHint('bin-image');
    expect(binImage.props.source).toEqual({
      testUri: '../../../src/assets/bin.png',
    });
  });

  it('should renders the logout text and logout image', () => {
    const {getByText} = render(
      <ProfileMoreOptionsModal visible={true} onClose={() => {}} />,
    );
    expect(getByText('Logout')).toBeTruthy();
    const logoutImage = screen.getByA11yHint('logout-image');
    expect(logoutImage.props.source).toEqual({
      testUri: '../../../src/assets/log-out.png',
    });
  });

  it('should renders the edit profile text and edit image', () => {
    const {getByText} = render(
      <ProfileMoreOptionsModal visible={true} onClose={() => {}} />,
    );
    expect(getByText('Edit Profile')).toBeTruthy();
    const binImage = screen.getByA11yHint('edit-image');
    expect(binImage.props.source).toEqual({
      testUri: '../../../src/assets/edit.png',
    });
  });
  it('should calls onClose when "Delete Account" is pressed', () => {
    render(<ProfileMoreOptionsModal visible={true} onClose={mockOnClose} />);
    fireEvent.press(screen.getByText('Delete Account'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should calls onClose when "Logout" is pressed', () => {
    render(<ProfileMoreOptionsModal visible={true} onClose={mockOnClose} />);
    fireEvent.press(screen.getByText('Logout'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should calls onClose when "Edit Profile" is pressed', () => {
    render(<ProfileMoreOptionsModal visible={true} onClose={mockOnClose} />);
    fireEvent.press(screen.getByText('Edit Profile'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
