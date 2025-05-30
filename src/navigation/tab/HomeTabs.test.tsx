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
  it('navigates to profileScreen when profile tab is pressed', async () => {
    const {getByText} = render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      const profileTab = getByText('Profile');
      fireEvent.press(profileTab);
    });
  });
   it('navigates to profile screen when profile tab is pressed', async () => {
    const {findByText, queryByText} = render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTabs />
        </NavigationContainer>
      </Provider>,
    );

    const profileTab = await findByText('Profile');

    fireEvent.press(profileTab);

    await waitFor(() => {
      expect(queryByText('First Name')).toBeTruthy();
    });
  });
});
