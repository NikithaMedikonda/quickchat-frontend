import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {Registration} from './Registration';
import {Alert, Platform} from 'react-native';

jest.mock('react-native-image-crop-picker', () => ({
  openPicker: jest.fn().mockResolvedValue({path: 'mocked/image/path.jpg'}),
}));

jest.mock('../../permissions/ImagePermissions', () => ({
  requestPermissions: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('Registration Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all input fields and buttons', () => {
    const {getByPlaceholderText, getByText} = render(<Registration />);
    expect(getByPlaceholderText('First Name')).toBeTruthy();
    expect(getByPlaceholderText('Last Name')).toBeTruthy();
    expect(getByPlaceholderText('Phone Number')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    expect(getByPlaceholderText('Email (Optional)')).toBeTruthy();
    expect(getByText('Register')).toBeTruthy();
    expect(getByText('Sign in')).toBeTruthy();
  });

  it('allows form input and clears after submit', () => {
    const {getByPlaceholderText, getByText, queryByDisplayValue} = render(
      <Registration />,
    );
    fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('Phone Number'), '9999999999');
    fireEvent.changeText(getByPlaceholderText('Password'), '1234');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), '1234');
    fireEvent.changeText(
      getByPlaceholderText('Email (Optional)'),
      'john@example.com',
    );

    fireEvent.press(getByText('Register'));

    expect(queryByDisplayValue('John')).toBeNull();
    expect(queryByDisplayValue('john@example.com')).toBeNull();
  });

  it('triggers image picker on logo press if permission granted (Android)', async () => {
    Platform.OS = 'android';
    const {requestPermissions} = require('../../permissions/ImagePermissions');
    requestPermissions.mockResolvedValue(true);

    const {getByTestId} = render(<Registration />);
    fireEvent.press(getByTestId('logo'));

    await waitFor(() => {
      expect(
        require('react-native-image-crop-picker').openPicker,
      ).toHaveBeenCalled();
    });
  });
  it('triggers image picker on logo press if permission granted (ios)', async () => {
    Platform.OS = 'ios';
    const {requestPermissions} = require('../../permissions/ImagePermissions');
    requestPermissions.mockResolvedValue(false);

    const {getByTestId} = render(<Registration />);
    fireEvent.press(getByTestId('logo'));

    await waitFor(() => {
      expect(
        require('react-native-image-crop-picker').openPicker,
      ).toHaveBeenCalled();
    });
  });

  it('alerts if permission denied (Android)', async () => {
    Platform.OS = 'android';
    const {requestPermissions} = require('../../permissions/ImagePermissions');
    requestPermissions.mockResolvedValue(false);

    const {getByTestId} = render(<Registration />);
    fireEvent.press(getByTestId('logo'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Permission Denied',
        'We need access to your photos to select an image.',
      );
    });
  });

  it('alerts if permission wrongly granted (iOS)', async () => {
    Platform.OS = 'ios';
    const {requestPermissions} = require('../../permissions/ImagePermissions');
    requestPermissions.mockResolvedValue(true);

    const {getByTestId} = render(<Registration />);
    fireEvent.press(getByTestId('logo'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Permission Denied',
        'We need access to your photos to select an image.',
      );
    });
  });
});
