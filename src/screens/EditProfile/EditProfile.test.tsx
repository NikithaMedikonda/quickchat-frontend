import React from 'react';
import {Alert} from 'react-native';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import { Platform, KeyboardAvoidingView } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import * as redux from 'react-redux';
import {Provider} from 'react-redux';
import {EditProfile} from './EditProfile';
import {store} from '../../store/store';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../components/ImagePickerModal/ImagePickerModal', () => ({
  ImagePickerModal: () => <></>,
}));

const mockNavigation = { setOptions: jest.fn() };
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => mockNavigation,
  };
});

jest.spyOn(Alert, 'alert');

describe('EditProfile Screen', () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    (redux.useDispatch as unknown as jest.Mock).mockReturnValue(dispatch);
    (redux.useSelector as unknown as jest.Mock).mockImplementation(callback =>
      callback({
        registration: {imageUri: null},
        login: {
          user: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          },
        },
      }),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <NavigationContainer>
          <EditProfile />
        </NavigationContainer>
      </Provider>,
    );

  it('renders input fields with user data', () => {
    const {getByDisplayValue} = renderComponent();

    expect(getByDisplayValue('John')).toBeTruthy();
    expect(getByDisplayValue('Doe')).toBeTruthy();
    expect(getByDisplayValue('john@example.com')).toBeTruthy();
  });

  it('shows error if first name is empty on save', async () => {
    const {getByPlaceholderText, getByText} = renderComponent();

    fireEvent.changeText(getByPlaceholderText('First Name'), '');
    fireEvent.press(getByText('Save'));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'First name is required'),
    );
  });

  it('shows error if email is invalid on save', async () => {
    const {getByPlaceholderText, getByText} = renderComponent();

    fireEvent.changeText(getByPlaceholderText('Email'), 'invalidemail');
    fireEvent.press(getByText('Save'));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid email format'),
    );
  });

  it('resets form when Cancel is pressed', async () => {
    const {getByPlaceholderText, getByText} = renderComponent();

    fireEvent.changeText(getByPlaceholderText('First Name'), 'NewName');
    fireEvent.press(getByText('Cancel'));

    await waitFor(() =>
      expect(getByPlaceholderText('First Name').props.value).toBe('John'),
    );
  });

  it('opens ImagePickerModal on image press', () => {
    const {getAllByRole} = renderComponent();

    fireEvent.press(getAllByRole('button')[0]);

    expect(dispatch).toHaveBeenCalledWith({
      type: 'registration/setIsVisible',
      payload: true,
    });
  });

  it('shows error if last name is empty on save', async () => {
  const {getByPlaceholderText, getByText} = renderComponent();

  fireEvent.changeText(getByPlaceholderText('Last Name'), '');
  fireEvent.press(getByText('Save'));

  await waitFor(() =>
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Last name is required'),
  );
});

it('allows saving when all inputs are valid', async () => {
  const {getByPlaceholderText, getByText} = renderComponent();

  fireEvent.changeText(getByPlaceholderText('First Name'), 'Jane');
  fireEvent.changeText(getByPlaceholderText('Last Name'), 'Smith');
  fireEvent.changeText(getByPlaceholderText('Email'), 'jane.smith@example.com');

  fireEvent.press(getByText('Save'));

  await waitFor(() => {
    expect(Alert.alert).not.toHaveBeenCalled();

  });
});

it('uses empty string defaults when user is undefined', () => {
  (redux.useSelector as unknown as jest.Mock).mockImplementation(callback =>
    callback({
      registration: {imageUri: null},
      login: {
        user: undefined,
      },
    }),
  );

  const {getByPlaceholderText} = renderComponent();

  expect(getByPlaceholderText('First Name').props.value).toBe('');
  expect(getByPlaceholderText('Last Name').props.value).toBe('');
  expect(getByPlaceholderText('Email').props.value).toBe('');
});

describe('KeyboardAvoidingView platform behavior', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  it('sets correct behavior and offset for iOS', () => {
    Platform.OS = 'ios';

    const {UNSAFE_getByType} = render(
      <Provider store={store}>
        <NavigationContainer>
          <EditProfile />
        </NavigationContainer>
      </Provider>,
    );

    const keyboardSafeArea = UNSAFE_getByType(KeyboardAvoidingView);
    expect(keyboardSafeArea.props.behavior).toBe('padding');
    expect(keyboardSafeArea.props.keyboardVerticalOffset).toBe(60);
  });

  it('sets correct behavior and offset for Android', () => {
    Platform.OS = 'android';

    const {UNSAFE_getByType} = render(
      <Provider store={store}>
        <NavigationContainer>
          <EditProfile />
        </NavigationContainer>
      </Provider>,
    );

    const kav = UNSAFE_getByType(KeyboardAvoidingView);
    expect(kav.props.behavior).toBe('height');
    expect(kav.props.keyboardVerticalOffset).toBe(0);
  });
});

});


