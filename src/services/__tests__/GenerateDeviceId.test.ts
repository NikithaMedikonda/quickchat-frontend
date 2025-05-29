import { getDeviceId } from '../GenerateDeviceId';
import EncryptedStorage from 'react-native-encrypted-storage';
import DeviceInfo from 'react-native-device-info';

jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn(),
}));

describe('getDeviceId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return deviceId if already stored in EncryptedStorage', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue('stored-device-id');

    const result = await getDeviceId();

    expect(EncryptedStorage.getItem).toHaveBeenCalledWith('deviceId');
    expect(DeviceInfo.getUniqueId).not.toHaveBeenCalled();
    expect(EncryptedStorage.setItem).not.toHaveBeenCalled();
    expect(result).toBe('stored-device-id');
  });

  it('should generate, store and return deviceId if not stored', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(null);
    (DeviceInfo.getUniqueId as jest.Mock).mockResolvedValue('new-unique-id');
    (EncryptedStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    const result = await getDeviceId();

    expect(EncryptedStorage.getItem).toHaveBeenCalledWith('deviceId');
    expect(DeviceInfo.getUniqueId).toHaveBeenCalled();
    expect(EncryptedStorage.setItem).toHaveBeenCalledWith('deviceId', 'new-unique-id');
    expect(result).toBe('new-unique-id');
  });

  it('should throw an error if EncryptedStorage or DeviceInfo throws', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

    await expect(getDeviceId()).rejects.toThrow('Error while generating the device ID: Storage error');
  });
});
