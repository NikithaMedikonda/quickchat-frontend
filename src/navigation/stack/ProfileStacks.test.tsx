import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import { ProfileStack } from './ProfileStacks';
import {store} from '../../store/store';

jest.mock('../../screens/Profile/Profile', () => {
  const React = require('react');
  const mockReactNative = require('react-native');

  return {
    Profile: ({navigation}: any) => {
      return (
        <>
          <mockReactNative.Text>Profile Screen</mockReactNative.Text>
          <mockReactNative.Button
            title="Edit Profile"
            onPress={() => navigation.navigate('editProfile')}
          />
        </>
      );
    },
  };
});

jest.mock('../../screens/EditProfile/EditProfile', () => {
  const mockReactNative = require('react-native');
  return {
    EditProfile: () => <mockReactNative.Text>Edit Profile Screen</mockReactNative.Text>,
  };
});

describe('ProfileStack Navigation', () => {
  const renderWithProviders = () =>
    render(
      <Provider store={store}>
        <NavigationContainer>
          <ProfileStack />
        </NavigationContainer>
      </Provider>
    );

  it('renders the Profile screen initially', async () => {
    const {getByText} = renderWithProviders();

    await waitFor(() => {
      expect(getByText('Profile Screen')).toBeTruthy();
    });
  });

  it('navigates to EditProfile screen on button press', async () => {
    const {getByText} = renderWithProviders();

    fireEvent.press(getByText('Edit Profile'));

    await waitFor(() => {
      expect(getByText('Edit Profile Screen')).toBeTruthy();
    });
  });
});
