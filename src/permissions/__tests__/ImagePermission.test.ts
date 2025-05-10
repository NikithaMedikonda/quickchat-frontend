import {Platform, Alert} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {requestPermissions} from '../ImagePermissions';

jest.mock('react-native-permissions', () => ({
  check: jest.fn(),
  request: jest.fn(),
  PERMISSIONS: {
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
      READ_MEDIA_IMAGES: 'android.permission.READ_MEDIA_IMAGES',
    },
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    LIMITED: 'limited',
  },
}));

jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

const setPlatform = (os: 'ios' | 'android') => {
  Object.defineProperty(Platform, 'OS', {
    get: () => os,
  });
};

describe('Test cases for requestPermissions function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return false when Android camera permission is granted after request', async () => {
    setPlatform('android');
    (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);
    (request as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

    const result = await requestPermissions('camera');
    expect(result).toBe(false);
  });

  test('should return true when Android camera permission is denied after request', async () => {
    setPlatform('android');
    (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);
    (request as jest.Mock).mockResolvedValue(RESULTS.DENIED);

    const result = await requestPermissions('camera');
    expect(result).toBe(true);
  });

  test('should return false when Android gallery permission is already granted', async () => {
    setPlatform('android');
    (check as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

    const result = await requestPermissions('gallery');
    expect(result).toBe(false);
  });

  test('should return true when Android gallery permission is denied after request', async () => {
    setPlatform('android');
    (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);
    (request as jest.Mock).mockResolvedValue(RESULTS.DENIED);

    const result = await requestPermissions('gallery');
    expect(result).toBe(true);
  });

  test('should return true when iOS camera permission is denied initially but granted after request', async () => {
    setPlatform('ios');
    (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);
    (request as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

    const result = await requestPermissions('camera');
    expect(result).toBe(true);
  });

  test('should return false when iOS camera permission is denied initially and also denied after request', async () => {
    setPlatform('ios');
    (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);
    (request as jest.Mock).mockResolvedValue(RESULTS.DENIED);

    const result = await requestPermissions('camera');
    expect(result).toBe(false);
  });

  test('should return true when iOS gallery permission is limited initially and granted after request', async () => {
    setPlatform('ios');
    (check as jest.Mock).mockResolvedValue(RESULTS.LIMITED);
    (request as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

    const result = await requestPermissions('gallery');
    expect(result).toBe(true);
  });

  test('should return false when iOS gallery permission is denied initially and also denied after request', async () => {
    setPlatform('ios');
    (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);
    (request as jest.Mock).mockResolvedValue(RESULTS.DENIED);

    const result = await requestPermissions('gallery');
    expect(result).toBe(false);
  });

  test('should show alert and return false when permission check throws an error', async () => {
    setPlatform('ios');
    (check as jest.Mock).mockRejectedValue(new Error('Permission error'));

    const result = await requestPermissions('camera');
    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Something went wrong while accessing permissions',
    );
    expect(result).toBe(false);
  });
});
