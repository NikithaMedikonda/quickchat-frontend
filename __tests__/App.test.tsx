import {App} from '../App';
import {render} from '@testing-library/react-native';
import i18next from 'i18next';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('react-native-image-crop-picker', () => ({
  openCamera: jest.fn().mockResolvedValue({path: 'mocked/path.jpg'}),
  openPicker: jest.fn().mockResolvedValue({path: 'mocked/path.jpg'}),
}));

jest.mock('react-native-phone-input', () => {
  const React = require('react');
  const { TextInput } = require('react-native');
  const MockPhoneInput = React.forwardRef((props: { value: any; onChangePhoneNumber: any; }, ref: any) => {
    return (
      <TextInput
        ref={ref}
        placeholder="Phone number"
        value={props.value}
        onChangeText={props.onChangePhoneNumber}
        testID="mock-phone-input"
      />
    );
  });
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

test('renders App component', () => {
  render(<App />);
});

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

test('runs useEffect on mount and sets language', () => {
  render(
      <App />
  );
  expect(i18next.changeLanguage).toHaveBeenCalledWith('te');
});
