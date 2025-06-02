import { checkDeviceStatus } from '../socket/socket';
import EncryptedStorage from 'react-native-encrypted-storage';
import { InitialStackProps } from '../types/usenavigation.type';

export const handleDeviceCheck = async (
  userPhoneNumber: string,
  deviceId: string,
  navigation: InitialStackProps,
): Promise<boolean> => {
  try {
    const result = await checkDeviceStatus(userPhoneNumber, deviceId);

    if (!result.success && result.action === 'logout') {
      await EncryptedStorage.clear();
      navigation.replace('welcome');
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};
