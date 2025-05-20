import {render} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {HomeTabs} from './HomeTabs';
jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}));
jest.mock('react-native-contacts', () => ({
  getContactsByPhoneNumber: jest.fn(),
}));
jest.mock('react-native-image-crop-picker', () => ({
  openPicker: jest.fn().mockResolvedValue({path: 'mocked/image/path.jpg'}),
  openCamera: jest.fn().mockResolvedValue({path: 'mocked/image/path.jpg'}),
}));

jest.mock('react-native-fs', () => ({
  readFile: jest.fn().mockResolvedValue('mocked-base64-string'),
}));

jest.mock('../../permissions/ImagePermissions', () => ({
  requestPermissions: jest.fn().mockResolvedValue(false),
}));

describe('Welcome Screen', () => {
  it('renders the Tabs', () => {
    render(
      <NavigationContainer>
        <HomeTabs />
      </NavigationContainer>,
    );
  });
});
