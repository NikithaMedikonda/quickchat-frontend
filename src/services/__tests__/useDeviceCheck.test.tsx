import {render, waitFor} from '@testing-library/react-native';
import {useDeviceCheck} from '../useDeviceCheck';
import {Provider} from 'react-redux';
import EncryptedStorage from 'react-native-encrypted-storage';
import * as navigationHook from '@react-navigation/native';
import {checkDeviceStatus} from '../../socket/socket';
import {getDeviceId} from '../GenerateDeviceId';
import {store} from '../../store/store';
import { resetForm } from '../../store/slices/registrationSlice';

jest.mock('react-native-encrypted-storage');
jest.mock('../../socket/socket');
jest.mock('../../services/GenerateDeviceId');

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: jest.fn(callback => {
    callback();
  }),
  useNavigation: jest.fn(),
}));

jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn(),
}));

jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(),
    clear: jest.fn(),
}));

const mockNavigation = {
  replace: jest.fn(),
};

const TestComponent = () => {
  const result = useDeviceCheck();
  return result;
};

describe('useDeviceCheck Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.dispatch(resetForm());

    (navigationHook.useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(null);
    (getDeviceId as jest.Mock).mockResolvedValue('device123');
    (checkDeviceStatus as jest.Mock).mockResolvedValue({success: true});
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>,
    );

  it('should call EncryptedStorage.getItem and show alert on device mismatch', async () => {
    const fakeUser = JSON.stringify({phoneNumber: '1234567890'});

    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(fakeUser);
    (getDeviceId as jest.Mock).mockResolvedValue('device123');
    (checkDeviceStatus as jest.Mock).mockResolvedValue({
      success: false,
      action: 'logout',
    });

    jest.useFakeTimers();

    renderComponent();
  await waitFor(() => {
  const state = store.getState();
  expect(state.registration.alertMessage).toBe(
    'You have logged in from another device.',
  );
});


    jest.runAllTimers();

    await waitFor(() => {
      expect(EncryptedStorage.clear).toHaveBeenCalled();
      expect(mockNavigation.replace).toHaveBeenCalledWith('welcome');
    });

    jest.useRealTimers();
  });

  it('should do nothing if no phone number is found', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(null);

    renderComponent();

    await waitFor(() => {
      expect(checkDeviceStatus).not.toHaveBeenCalled();
    });
  });

  it('should do nothing if user data is empty', async () => {
    const emptyUser = JSON.stringify({});
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(emptyUser);

    renderComponent();

    await waitFor(() => {
      expect(checkDeviceStatus).not.toHaveBeenCalled();
    });
  });

  it('should call checkDeviceStatus when user and deviceId are available', async () => {
    const fakeUser = JSON.stringify({phoneNumber: '1234567890'});

    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(fakeUser);
    (getDeviceId as jest.Mock).mockResolvedValue('device123');
    (checkDeviceStatus as jest.Mock).mockResolvedValue({success: true});

    renderComponent();

    await waitFor(() => {
      expect(checkDeviceStatus).toHaveBeenCalledWith('1234567890', 'device123');
    });
  });

  it('should not clear storage if device check is successful', async () => {
    const fakeUser = JSON.stringify({phoneNumber: '1234567890'});

    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(fakeUser);
    (getDeviceId as jest.Mock).mockResolvedValue('device123');
    (checkDeviceStatus as jest.Mock).mockResolvedValue({success: true});

    renderComponent();

    await waitFor(() => {
      expect(checkDeviceStatus).toHaveBeenCalled();
    });

    expect(EncryptedStorage.clear).not.toHaveBeenCalled();
    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });
});
