import DeviceInfo from 'react-native-device-info';
import EncryptedStorage from 'react-native-encrypted-storage';

export async function getDeviceId(): Promise<string> {
  try {
    let deviceId = await EncryptedStorage.getItem('deviceId');

    if (!deviceId) {
      const uniqueId = await DeviceInfo.getUniqueId();
      await EncryptedStorage.setItem('deviceId', uniqueId);
      deviceId = uniqueId;
    }

    return deviceId;
  } catch (error) {
    throw new Error(
      `Error while generating the device ID: ${(error as Error).message}`,
    );
  }
}
