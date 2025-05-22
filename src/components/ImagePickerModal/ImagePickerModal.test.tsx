import { Alert, Platform } from 'react-native';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { AlertNotificationRoot, Dialog } from 'react-native-alert-notification';
import ImageCropPicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../../store/store';
import {
  setImage,
  setImageUri,
  setIsVisible,
  setImageDeleted,
  resetForm,
} from '../../store/slices/registrationSlice';
import { ImagePickerModal } from './ImagePickerModal';
import { DEFAULT_PROFILE_IMAGE } from '../../constants/defaultImage';


jest.mock('react-native-fs', () => ({
  readFile: jest.fn().mockResolvedValue('mocked-base64-string'),
}));

jest.mock('react-native-image-crop-picker', () => ({
  openPicker: jest.fn().mockResolvedValue({path: 'mocked/image/path.jpg'}),
  openCamera: jest.fn().mockResolvedValue({path: 'mocked/image/path.jpg'}),
}));

jest.mock('../../permissions/ImagePermissions', () => ({
  requestPermissions: jest.fn().mockResolvedValue(false),
}));

jest.mock('react-native-alert-notification', () => ({
  ALERT_TYPE: {
    DANGER: 'DANGER',
  },
  Dialog: {
    show: jest.fn(),
  },
  AlertNotificationRoot: ({children}: {children: React.ReactNode}) => children,
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
  const mockUser = {
    phoneNumber: '9876543210',
    firstName: 'Test1',
    lastName: 'Test2',
    profilePicture: 'image.jpg',
    email: 'testuser@gmail.com',
  };

  beforeEach(() => {
    useDispatchMock.mockImplementation(() => mockDispatch);
    store.dispatch(resetForm());
    useSelectorMock.mockImplementation((selector: any) =>
      selector({
        registration: {
          isVisible: true,
        },
        login: {
          user: mockUser,
        },
      }),
    );
    jest.clearAllMocks();
  });

  it('renders modal and displays correct content', () => {
    render(
        <AlertNotificationRoot>
          <ImagePickerModal />
        </AlertNotificationRoot>
    );
    expect(screen.getByText('Choose Profile')).toBeTruthy();
    expect(screen.getByA11yHint('camera-image')).toBeTruthy();
    expect(screen.getByA11yHint('gallery-image')).toBeTruthy();
  });

  it('closes modal when pressing the cancel button', () => {
    render(
        <AlertNotificationRoot>
          <ImagePickerModal />
        </AlertNotificationRoot>
    );
    const cancelButton = screen.getByA11yHint('cross-icon');
    fireEvent.press(cancelButton);
    expect(mockDispatch).toHaveBeenCalledWith(setIsVisible(false));
  });

  it('shows delete button when `showDeleteOption` is true', () => {
    render(
        <AlertNotificationRoot>
          <ImagePickerModal showDeleteOption={true} />
        </AlertNotificationRoot>
    );
    expect(screen.getByA11yHint('delete-image')).toBeTruthy();
  });

  it('handles image deletion correctly', () => {
    render(
        <AlertNotificationRoot>
          <ImagePickerModal showDeleteOption={true} />
        </AlertNotificationRoot>
    );
    const deleteButton = screen.getByA11yHint('delete-image');
    fireEvent.press(deleteButton);
    expect(mockDispatch).toHaveBeenCalledWith(
      setImageUri(DEFAULT_PROFILE_IMAGE),
    );
    expect(mockDispatch).toHaveBeenCalledWith(setImage(DEFAULT_PROFILE_IMAGE));
    expect(mockDispatch).toHaveBeenCalledWith(setImageDeleted(true));
    expect(mockDispatch).toHaveBeenCalledWith(setIsVisible(false));
  });

  it('shows alert when permission denied on iOS', async () => {
    Platform.OS = 'ios';
    const {requestPermissions} = require('../../permissions/ImagePermissions');
    requestPermissions.mockResolvedValue(false);

    render(
        <AlertNotificationRoot>
          <ImagePickerModal />
        </AlertNotificationRoot>
    );
    const galleryButton = screen.getByA11yHint('gallery-image');
    fireEvent.press(galleryButton);

    await waitFor(() => {
      expect(Dialog.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'DANGER',
          title: 'Error',
          textBody:
            'Permission Denied, We need access to your photos to continue.',
          button: 'close',
          closeOnOverlayTap: true,
        }),
      );
    });
  });

  it('shows alert when permission denied on Android', async () => {
    Platform.OS = 'android';
    const {requestPermissions} = require('../../permissions/ImagePermissions');
    requestPermissions.mockResolvedValue(true);

    render(
        <AlertNotificationRoot>
          <ImagePickerModal />
        </AlertNotificationRoot>
    );
    const galleryButton = screen.getByA11yHint('gallery-image');
    fireEvent.press(galleryButton);
    await waitFor(() => {
      expect(Dialog.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'DANGER',
          title: 'Error',
          textBody:
            'Permission Denied, We need access to your photos to continue.',
          button: 'close',
          closeOnOverlayTap: true,
        }),
      );
    });
  });

  it('handles image picking from gallery', async () => {
    const {requestPermissions} = require('../../permissions/ImagePermissions');
    requestPermissions.mockResolvedValue(true);
    Platform.OS = 'ios';

    render(
        <AlertNotificationRoot>
          <ImagePickerModal />
        </AlertNotificationRoot>
    );
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
      expect(mockDispatch).toHaveBeenCalledWith(setImageDeleted(false));
      expect(mockDispatch).toHaveBeenCalledWith(setIsVisible(false));
    });
  });

  it('handles image picking from camera', async () => {
    const {requestPermissions} = require('../../permissions/ImagePermissions');
    requestPermissions.mockResolvedValue(true);
    Platform.OS = 'ios';

    render(
        <AlertNotificationRoot>
          <ImagePickerModal />
        </AlertNotificationRoot>
    );
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
      expect(mockDispatch).toHaveBeenCalledWith(setImageDeleted(false));
      expect(mockDispatch).toHaveBeenCalledWith(setIsVisible(false));
    });
  });
});
