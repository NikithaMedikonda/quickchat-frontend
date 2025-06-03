import {NavigationContainer} from '@react-navigation/native';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {store} from '../../store/store';
import {HomeTabs} from './HomeTabs';

jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest
    .fn()
    .mockResolvedValue(
      JSON.stringify({name: 'Mamatha', phoneNumber: '+91 6303974914'}),
    ),
  setItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('../../services/useDeviceCheck', () => ({
  useDeviceCheck: jest.fn(),
}));

jest.mock('react-native-contacts', () => ({
  getContactsByPhoneNumber: jest.fn(),
  getAllWithoutPhotos: jest.fn(),
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

jest.mock('../../helpers/nameNumberIndex', () => ({
  numberNameIndex: jest.fn().mockResolvedValue({
    '+916303961097': 'Test User',
  }),
}));

describe('Welcome Screen', () => {
  it('renders the Tabs', async () => {
    await waitFor(() => {
      render(
        <Provider store={store}>
          <NavigationContainer>
            <HomeTabs />
          </NavigationContainer>
        </Provider>,
      );
    });
  });
    it('navigates to profileScreen when Profile tab is pressed', async () => {
    const { getAllByText} = render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );
    const profileTab = getAllByText('Profile')[0];
    fireEvent.press(profileTab);
  });
});
