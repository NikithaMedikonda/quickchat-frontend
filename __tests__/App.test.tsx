import {App} from '../App';
import {render, waitFor} from '@testing-library/react-native';
import i18next from 'i18next';

jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn(),
}));

jest.mock('@react-native-firebase/app', () => ({}));
jest.mock('@react-native-firebase/messaging', () => () => ({
  getToken: jest.fn().mockResolvedValue('mocked-fcm-token'),
  requestPermission: jest.fn(),
}));
jest.mock('@notifee/react-native', () => ({
  AndroidImportance: {},
  requestPermission: jest.fn(),
}));
jest.mock('../src/permissions/NotificationPermissions', () => ({
  getFCMToken: jest.fn(),
  listenForForegroundMessages: jest.fn(),
}));
jest.mock('react-native-image-crop-picker', () => ({
  openCamera: jest.fn().mockResolvedValue({path: 'mocked/path.jpg'}),
  openPicker: jest.fn().mockResolvedValue({path: 'mocked/path.jpg'}),
}));
jest.mock('react-native-contacts', () => ({
  getContactsByPhoneNumber: jest.fn(),
}));
jest.mock('react-native-phone-input', () => {
  const React = require('react');
  const {TextInput} = require('react-native');
  const MockPhoneInput = React.forwardRef(
    (props: {value: any; onChangePhoneNumber: any}, ref: any) => {
      return (
        <TextInput
          ref={ref}
          placeholder="Phone number"
          value={props.value}
          onChangeText={props.onChangePhoneNumber}
          testID="mock-phone-input"
        />
      );
    },
  );
  return MockPhoneInput;
});

jest.mock('react-native-splash-screen', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

jest.mock('react-native-fs', () => ({
  readFile: jest.fn().mockResolvedValue('mockedBase64Image'),
}));
jest.mock('phone');
jest.mock('react-native-phone-input', () => {
  const {useState, forwardRef} = require('react');
  const {TextInput} = require('react-native');
  const MockPhoneInput = forwardRef(
    (props: {value: any; onChangePhoneNumber: any}, ref: any) => {
      const [phoneNumber, setPhoneNumber] = useState(props.value);

      const handleChangeText = (text: any) => {
        setPhoneNumber(text);
        props.onChangePhoneNumber(text);
      };
      return (
        <TextInput
          ref={ref}
          placeholder="Phone number"
          value={phoneNumber}
          onChangeText={handleChangeText}
          testID="mock-phone-input"
        />
      );
    },
  );
  return MockPhoneInput;
});
jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
      WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
    },
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
    LIMITED: 'limited',
  },
  check: jest.fn().mockResolvedValue('granted'),
  request: jest.fn().mockResolvedValue('granted'),
}));

jest.mock('../src/database/connection/connection', () => ({
  getDBInstance: jest.fn().mockResolvedValue({executeSql: jest.fn()}),
}));

jest.mock('../src/database/models/schema', () => ({
  createTables: jest.fn(),
}));

jest.mock('react-native-localize', () => ({
  getLocales: () => [{languageCode: 'te'}],
}));

jest.mock('i18next', () => {
  const actual = jest.requireActual('i18next');
  return {
    ...actual,
    use: () => ({
      init: jest.fn(),
    }),
    changeLanguage: jest.fn(),
  };
});

jest.mock('react-native-libsodium', () => ({
  crypto_box_keypair: jest.fn(),
  to_base64: jest.fn((input: Uint8Array) =>
    Buffer.from(input).toString('base64'),
  ),
  crypto_generichash: jest.fn(() => new Uint8Array(32).fill(1)),
  crypto_secretbox_easy: jest.fn(() => new Uint8Array(64).fill(2)),
  randombytes_buf: jest.fn(() => new Uint8Array(24).fill(3)),
  from_base64: jest.fn((input: string) =>
    Uint8Array.from(Buffer.from(input, 'base64')),
  ),
  crypto_secretbox_open_easy: jest.fn(
    () => new Uint8Array(Buffer.from('secret-key')),
  ),
  crypto_box_open_easy: jest.fn(() =>
    Uint8Array.from(Buffer.from('my-private-key')),
  ),
  crypto_box_easy: jest.fn(() => new Uint8Array(64).fill(1)),
}));

describe('Test for App component', () => {
  test('renders App component', async () => {
    await waitFor(() => {
      render(<App />);
    });
  });

  test('runs useEffect on mount and sets language', async () => {
    render(<App />);
    await waitFor(() => {
      expect(i18next.changeLanguage).toHaveBeenCalledWith('te');
    });
  });

  test('calls createTables and DB init logic', async () => {
    const {createTables} = require('../src/database/models/schema');
    const {getDBInstance} = require('../src/database/connection/connection');

    render(<App />);
    await waitFor(() => {
      expect(getDBInstance).toHaveBeenCalled();
      expect(createTables).toHaveBeenCalled();
    });
  });
});
