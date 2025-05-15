import {
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react-native';
import React from 'react';
import {Alert} from 'react-native';
import * as redux from 'react-redux';
import {Provider} from 'react-redux';
import {EditProfile} from './EditProfile';
import {useDispatch} from 'react-redux';
import {store} from '../../store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {editProfile} from '../../services/editProfile';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
const mockDispatch = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));
const useDispatchMock = jest.mocked(useDispatch);

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../services/editProfile', () => ({
  editProfile: jest.fn(),
}));

jest.mock('../../components/ImagePickerModal/ImagePickerModal', () => ({
  ImagePickerModal: () => <></>,
}));

const mockNavigation = {setOptions: jest.fn(), replace: jest.fn()};
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => mockNavigation,
  };
});

jest.spyOn(Alert, 'alert');

describe('EditProfile Component', () => {
  const dispatch = jest.fn();
  useDispatchMock.mockImplementation(() => mockDispatch);
  beforeEach(() => {
    (redux.useDispatch as unknown as jest.Mock).mockReturnValue(dispatch);
    (redux.useSelector as unknown as jest.Mock).mockImplementation(callback =>
      callback({
        registration: {imageUri: null},
        login: {
          user: {
            firstName: '',
            lastName: '',
            email: '',
          },
        },
      }),
    );
  });

  (AsyncStorage.getItem as jest.Mock).mockImplementation(key => {
    if (key === 'user') {
      return Promise.resolve(
        JSON.stringify({
          firstName: 'test',
          lastName: 'user',
          email: 'testuser@gmail.com',
          profilePhoto: '',
          phoneNumber: '1234567890',
        }),
      );
    }
    if (key === 'authToken') {
      return Promise.resolve('mock-token');
    }
    return Promise.resolve(null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the profile image and input fields', async () => {
    const {getByText, getByAccessibilityHint} = render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => {
      expect(getByAccessibilityHint('Profile-Picture')).toBeTruthy();
    });

    expect(getByText('First Name')).toBeTruthy();
    expect(getByText('Last Name')).toBeTruthy();
    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Save')).toBeTruthy();
  });

  test('shows alert if first name is missing', async () => {
    const {getByText} = render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );
    await waitFor(() => fireEvent.press(getByText('Save')));
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'First name is required',
      ),
    );
  });

  test('shows alert for invalid email format', async () => {
    (editProfile as jest.Mock).mockResolvedValue({
      data: {
        user: {
          firstName: 'test',
          lastName: 'user',
          email: 'testuser@gmail.com',
          phoneNumber: '1234567890',
        },
      },
    });
    const {getByText, getByDisplayValue} = render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );
    await waitFor(() => getByText('Save'));
    fireEvent.changeText(getByDisplayValue('test'), 'test');
    fireEvent.changeText(getByDisplayValue('user'), 'user');
    fireEvent.changeText(
      getByDisplayValue('testuser@gmail.com'),
      'invalidemail',
    );
    fireEvent.press(getByText('Save'));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid email format'),
    );
  });
  test('shows alert for invalid last name', async () => {
    (editProfile as jest.Mock).mockResolvedValue({
      data: {
        user: {
          firstName: 'test',
          lastName: '',
          email: 'testuser@gmail.com',
          phoneNumber: '1234567890',
        },
      },
    });
    const {getByText, getByDisplayValue} = render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );
    await waitFor(() => getByText('Save'));
    fireEvent.changeText(getByDisplayValue('test'), 'test');
    fireEvent.changeText(getByDisplayValue('user'), '');
    fireEvent.changeText(
      getByDisplayValue('testuser@gmail.com'),
      'testuser@gmail.com',
    );
    fireEvent.press(getByText('Save'));
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Last name is required',
      ),
    );
  });

  test('calls editProfile and navigates on successful save', async () => {
    (editProfile as jest.Mock).mockResolvedValue({
      data: {
        user: {
          firstName: 'test',
          lastName: 'user',
          email: 'testuser@gmail.com',
          phoneNumber: '1234567890',
        },
      },
    });

    const {getByText, getByDisplayValue} = render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => {
      expect(getByDisplayValue('test')).toBeTruthy();
      expect(getByDisplayValue('user')).toBeTruthy();
      expect(getByDisplayValue('testuser@gmail.com')).toBeTruthy();
    });
    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(editProfile).toHaveBeenCalledWith(
        {
          phoneNumber: '1234567890',
          image: undefined,
          firstName: 'test',
          lastName: 'user',
          email: 'testuser@gmail.com',
          token: 'mock-token',
        },
        expect.any(Object),
      );
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      expect(mockNavigation.replace).toHaveBeenCalledWith('profileScreen');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Profile updated successfully!',
      );
    });
  });

  test('shows error alert on editProfile failure', async () => {
    (editProfile as jest.Mock).mockRejectedValue(new Error('Network error'));

    const {getByText, getByDisplayValue} = render(
      <Provider store={store}>
        <EditProfile />
      </Provider>,
    );

    await waitFor(() => getByText('Save'));
    fireEvent.changeText(getByDisplayValue('test'), 'test');
    fireEvent.changeText(getByDisplayValue('user'), 'user');
    fireEvent.changeText(
      getByDisplayValue('testuser@gmail.com'),
      'testuser@gmail.com',
    );
    fireEvent.press(getByText('Save'));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to update profile',
      ),
    );

  });
});
