import { PermissionsAndroid } from 'react-native';
import Contacts from 'react-native-contacts';
import EncryptedStorage from 'react-native-encrypted-storage';
import { numberNameIndex } from '../nameNumberIndex';

jest.mock('react-native-contacts', () => ({
  getAllWithoutPhotos: jest.fn(),
}));

jest.mock('react-native', () => ({
  PermissionsAndroid: {
    check: jest.fn(() => Promise.resolve(true)),
    request: jest.fn(),
    PERMISSIONS: {READ_CONTACTS: 'READ_CONTACTS'},
    RESULTS: {GRANTED: 'granted'},
  },
  Platform: {OS: 'android'},
}));

jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(),
}));

describe('Testing nameNumberIndex function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return indexed contacts with correct names', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({name: 'Mamatha', phoneNumber: '+91 6303974914'}),
    );
    (Contacts.getAllWithoutPhotos as jest.Mock).mockResolvedValue([
      {
        givenName: 'Usha',
        phoneNumbers: [{number: '+91 6303961097'}],
      },
      {
        givenName: 'Mamatha',
        phoneNumbers: [{number: '+91 6303974914'}],
      },
    ]);

    const result = await numberNameIndex();
    expect(result).toEqual({
      '+916303961097': 'Usha',
      '+916303974914': 'Mamatha (You)',
    });
  });

  it('should throw an error if user is not in storage', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(null);
    const result = await numberNameIndex();

    expect(result).toBeNull();
  });

  it('should handle errors from Contacts.getAllWithoutPhotos', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({name: 'Mamatha', phoneNumber: '+91 9876543210'}),
    );
    (Contacts.getAllWithoutPhotos as jest.Mock).mockRejectedValue(
      new Error(
        'Tried to use permissions API while not attached to an activity',
      ),
    );
    await expect(numberNameIndex()).rejects.toThrow(
      'Error while fetching contacts: Tried to use permissions API while not attached to an activity',
    );
  });

  it('should label the contact as "(You)" if number matches user', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({name: 'Mamatha', phoneNumber: '+91 6303974914 '}),
    );
    (Contacts.getAllWithoutPhotos as jest.Mock).mockResolvedValue([
      {
        givenName: 'Mamatha',
        phoneNumbers: [{number: '+91 6303974914'}],
      },
    ]);
    const result = await numberNameIndex();
    expect(result).toEqual({
      '+916303974914': 'Mamatha (You)',
    });
  });

  it('should label the contact normally if number does not match user', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({name: 'Mamatha', phoneNumber: '+91 6303974914 '}),
    );
    (Contacts.getAllWithoutPhotos as jest.Mock).mockResolvedValue([
      {
        givenName: 'Usha',
        phoneNumbers: [{number: '+91 6303961097--'}],
      },
    ]);
    const result = await numberNameIndex();
    expect(result).toEqual({
      '+916303961097': 'Usha',
    });
  });

  it('should fallback to displayName if givenName is missing', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({name: 'Usha', phoneNumber: '+91 6303961097'}),
    );

    (Contacts.getAllWithoutPhotos as jest.Mock).mockResolvedValue([
      {
        givenName: '',
        displayName: 'Mamatha Niyal B182217',
        phoneNumbers: [{number: '+91 6303974914'}],
      },
    ]);
    const result = await numberNameIndex();
    expect(result).toEqual({
      '+916303974914': 'Mamatha Niyal B182217',
    });
  });

  it('should label as "unknown" if both givenName and displayName are missing', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({name: 'Usha', phoneNumber: '+91 6303961097'}),
    );

    (Contacts.getAllWithoutPhotos as jest.Mock).mockResolvedValue([
      {
        givenName: '',
        displayName: '',
        phoneNumbers: [{number: '+91 6303974914'}],
      },
    ]);

    const result = await numberNameIndex();

    expect(result).toEqual({
      '+916303974914': 'unknown',
    });
  });
});

describe('Android Permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should skip requesting permission if already granted', async () => {
    (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ name: 'Mamatha', phoneNumber: '+91 6303974914' }),
    );
    (Contacts.getAllWithoutPhotos as jest.Mock).mockResolvedValue([
      {
        givenName: 'Usha',
        phoneNumbers: [{ number: '+91 6303961097' }],
      },
    ]);

    const result = await numberNameIndex();
    expect(result).toEqual({
      '+916303961097': 'Usha',
    });
  });

  it('should request permission if not already granted and proceed if granted', async () => {
    (PermissionsAndroid.check as jest.Mock).mockResolvedValue(false);
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue('granted');
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ name: 'Mamatha', phoneNumber: '+91 6303974914' }),
    );
    (Contacts.getAllWithoutPhotos as jest.Mock).mockResolvedValue([
      {
        givenName: 'Usha',
        phoneNumbers: [{ number: '+91 6303961097' }],
      },
    ]);

    const result = await numberNameIndex();
    expect(result).toEqual({
      '+916303961097': 'Usha',
    });
  });

  it('should throw an error if permission is denied', async () => {
    (PermissionsAndroid.check as jest.Mock).mockResolvedValue(false);
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue('denied');

    await expect(numberNameIndex()).rejects.toThrow('Contacts permission denied');
  });
});
