import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {Registration} from './Registration.tsx';
import * as ImagePicker from 'react-native-image-crop-picker';
import {Alert, Platform} from 'react-native';
import {requestPermissions} from '../../permissions/ImagePermissions.ts';

jest.mock('react-native-image-crop-picker', () => ({
  openPicker: jest.fn().mockResolvedValue({path: 'mocked/image/path.jpg'}),
}));
jest.mock('../../permissions/ImagePermissions.ts', () => ({
  requestPermissions: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

jest.mock('../../constants/colors.ts', () => ({
  useThemeColors: () => ({
    primary: 'blue',
    background: 'white',
    text: 'black',
  }),
}));

jest.mock('react-native-permissions', () => ({
  check: jest.fn(),
  request: jest.fn(),
  PERMISSIONS: {},
  RESULTS: {},
}));

describe('Registration Screen', () => {
  it('renders all input fields and buttons', () => {
    const {getByText, getByPlaceholderText} = render(<Registration />);
    expect(getByPlaceholderText('First Name')).toBeTruthy();
    expect(getByPlaceholderText('Last Name')).toBeTruthy();
    expect(getByPlaceholderText('Phone Number')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    expect(getByPlaceholderText('Email (Optional)')).toBeTruthy();
    expect(getByText('Register')).toBeTruthy();
    expect(getByText('Sign in')).toBeTruthy();
  });

  it('triggers image picker when image is pressed', async () => {
    const {getByTestId} = render(<Registration />);
    const logo = getByTestId('logo');
    fireEvent.press(logo);
    await waitFor(() => {
      expect(ImagePicker.openPicker).toHaveBeenCalled();
    });
  });

  it('submits form and resets fields', () => {
    const {getByPlaceholderText, getByText, queryByDisplayValue} = render(
      <Registration />,
    );
    fireEvent.changeText(getByPlaceholderText('First Name'), 'Testuser');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Phone Number'), '1234567890');
    fireEvent.changeText(getByPlaceholderText('Password'), 'pass123');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'pass123');
    fireEvent.changeText(
      getByPlaceholderText('Email (Optional)'),
      'testuser@gmail.com',
    );
    fireEvent.press(getByText('Register'));
    expect(queryByDisplayValue('Testuser')).toBeNull();
    expect(queryByDisplayValue('testuser@gmail.com')).toBeNull();
  });

  it('should alert if permission is denied for andriod', async () => {
    Platform.OS = 'android';
    (requestPermissions as jest.Mock).mockResolvedValue(false);
    const {getByTestId} = render(<Registration />);
    fireEvent.press(getByTestId('logo'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Permission Denied',
        'We need access to your photos to select an image.',
      );
    });
  });
  it('should alert if permission is denied for ios', async () => {
    Platform.OS = 'ios';
    (requestPermissions as jest.Mock).mockResolvedValue(true);
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
