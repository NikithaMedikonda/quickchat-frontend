import React from 'react';
import {
  render,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react-native';
import {ImagePickerModal} from './ImagePickerModal';
import {useDispatch, useSelector} from 'react-redux';
import RNFS from 'react-native-fs';
import ImageCropPicker from 'react-native-image-crop-picker';
import {
  setImageUri,
  setImage,
  setIsVisible,
} from '../../store/slices/registrationSlice';
import {Alert, Platform} from 'react-native';

jest.mock('react-native-fs', () => ({
  readFile: jest.fn().mockResolvedValue('mocked-base64-string'),
}));

jest.mock('react-native-image-crop-picker', () => ({
  openPicker: jest.fn().mockResolvedValue({path: 'mocked/image/path.jpg'}),
  openCamera: jest.fn().mockResolvedValue({path: 'mocked/image/path.jpg'}),
}));
jest.mock('../../services/RegisterUser.ts', () => ({
  registerUser: jest.fn(),
}));

jest.mock('../../permissions/ImagePermissions', () => ({
  requestPermissions: jest.fn().mockResolvedValue(false),
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
const useDispatchMock = jest.mocked(useDispatch);
const useSelectorMock = jest.mocked(useSelector);
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('ImagePickerModal', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    useDispatchMock.mockImplementation(() => mockDispatch);
    useSelectorMock.mockImplementation((selector: any) =>
      selector({
        registration: {
          isVisible: true,
        },
      }),
    );
    jest.clearAllMocks();
  });

  it('renders modal and displays correct content', () => {
    render(<ImagePickerModal />);
    expect(screen.getByText('Choose Profile')).toBeTruthy();
    expect(screen.getByA11yHint('camera-image')).toBeTruthy();
    expect(screen.getByA11yHint('gallery-image')).toBeTruthy();
  });

  it('closes modal when pressing the cancel button', () => {
    render(<ImagePickerModal />);
    const cancelButton = screen.getByA11yHint('cross-icon');
    fireEvent.press(cancelButton);
    expect(mockDispatch).toHaveBeenCalledWith(setIsVisible(false));
  });

  it('handles image picking from gallery', async () => {
    Platform.OS = 'android';
    const { requestPermissions } = require('../../permissions/ImagePermissions');
    requestPermissions.mockResolvedValue(false);
    render(<ImagePickerModal />);
    const galleryButton = screen.getByA11yHint('gallery-image');
    fireEvent.press(galleryButton);
    await waitFor(() => {
      expect(ImageCropPicker.openPicker).toHaveBeenCalledWith({
        width: 300,
        height: 300,
        cropping: true,
        includeBase64: false,
      });
      expect(RNFS.readFile).toHaveBeenCalledWith(
        'mocked/image/path.jpg',
        'base64',
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        setImageUri('mocked/image/path.jpg'),
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        setImage('data:image/jpeg;base64,mocked-base64-string'),
      );
    });
  });


  it('should give alert when permission is denied from gallery in iOS', async () => {
    Platform.OS = 'ios';
    const { requestPermissions } = require('../../permissions/ImagePermissions');
    requestPermissions.mockResolvedValue(false);
    render(<ImagePickerModal />);
    const galleryButton = screen.getByA11yHint('gallery-image');
    fireEvent.press(galleryButton);
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Permission Denied',
        'We need access to your photos to continue.',
      );
    });
  });
  

  it('handles image picking from camera in ios', async () => {
    render(<ImagePickerModal />);
    Platform.OS === 'ios';
    const {requestPermissions} = require('../../permissions/ImagePermissions');
    requestPermissions.mockResolvedValue(true);
    const cameraButton = screen.getByA11yHint('camera-image');
    fireEvent.press(cameraButton);

    await waitFor(() => {
      expect(ImageCropPicker.openCamera).toHaveBeenCalledWith({
        width: 300,
        height: 300,
        cropping: true,
        includeBase64: false,
      });
      expect(RNFS.readFile).toHaveBeenCalledWith(
        'mocked/image/path.jpg',
        'base64',
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        setImageUri('mocked/image/path.jpg'),
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        setImage('data:image/jpeg;base64,mocked-base64-string'),
      );
    });
  });

  it('handles image picking from gallery', async () => {
    render(<ImagePickerModal />);

    const galleryButton = screen.getByA11yHint('gallery-image');
    fireEvent.press(galleryButton);

    await waitFor(() => {
      expect(ImageCropPicker.openPicker).toHaveBeenCalledWith({
        width: 300,
        height: 300,
        cropping: true,
        includeBase64: false,
      });
      expect(RNFS.readFile).toHaveBeenCalledWith(
        'mocked/image/path.jpg',
        'base64',
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        setImageUri('mocked/image/path.jpg'),
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        setImage('data:image/jpeg;base64,mocked-base64-string'),
      );
    });
  });
});
