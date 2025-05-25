import {PermissionsAndroid, Platform} from 'react-native';
import Contacts from 'react-native-contacts';
import EncryptedStorage from 'react-native-encrypted-storage';
import {API_URL} from '../../constants/api';
import {getContacts} from '../GetContacts';

jest.mock('react-native-contacts', () => ({
  getAll: jest.fn(),
}));

jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: {OS: 'android'},
  PermissionsAndroid: {
    request: jest.fn(),
    PERMISSIONS: {
      READ_CONTACTS: 'android.permission.READ_CONTACTS',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
    },
  },
}));

global.fetch = jest.fn();

describe('Tests for getContacts function', () => {
  const mockContacts = [
    {
      phoneNumbers: [{number: '(555) 123-4567'}, {number: '123-456-7890'}],
    },
    {
      phoneNumbers: [{number: '+1 (800)555-1212'}],
    },
  ];

  const formattedNumbers = ['5551234567', '1234567890', '+18005551212'];

  beforeAll(() => {
    (Contacts.getAll as jest.Mock).mockResolvedValue([
      {
        phoneNumbers: [{number: '123-456-7890'}, {number: '(098) 765-4321'}],
      },
      {
        phoneNumbers: [{number: '111 222 3333'}],
      },
    ]);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should fetch contacts and send to server when permission is granted and token exists', async () => {
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue('granted');
    (Contacts.getAll as jest.Mock).mockResolvedValue([
      {phoneNumbers: [{number: '(123) 456-7890'}]},
      {phoneNumbers: [{number: '987-654-3210'}]},
    ]);
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue('dummy-token');

    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({
        data: ['user1', 'user2'],
      }),
    });

    const result = await getContacts();

    expect(PermissionsAndroid.request).toHaveBeenCalled();
    expect(Contacts.getAll).toHaveBeenCalled();
    expect(EncryptedStorage.getItem).toHaveBeenCalledWith('authToken');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/contacts'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          authorization: 'Bearer dummy-token',
        }),
      }),
    );
    expect(result).toEqual({
      status: 200,
      data: ['user1', 'user2'],
    });
  });

  it('should fetch contacts and send cleaned phone numbers to the API', async () => {
    (Contacts.getAll as jest.Mock).mockResolvedValue(mockContacts);
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue('token');
    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({
        data: {
          registeredUsers: ['5551234567', '1234567890'],
          unRegisteredusers: ['+18005551212'],
        },
      }),
    });
    const result = await getContacts();

    expect(Contacts.getAll).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(`${API_URL}/api/users/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: 'Bearer token',
      },
      body: JSON.stringify(formattedNumbers),
    });

    expect(result).toEqual({
      status: 200,
      data: {
        registeredUsers: ['5551234567', '1234567890'],
        unRegisteredusers: ['+18005551212'],
      },
    });
  });

  it('should throw an error if authToken is not found', async () => {
    (Contacts.getAll as jest.Mock).mockResolvedValue(mockContacts);
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(null);
    await expect(getContacts()).rejects.toThrow('Authorization failed');
  });

  it('should throw error if fetch fails', async () => {
    (Contacts.getAll as jest.Mock).mockResolvedValue(mockContacts);
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue('token');
    (fetch as jest.Mock).mockRejectedValueOnce('Network failed');
    await expect(getContacts()).rejects.toThrow('Network failed');
  });

  it('should throw error when permission is denied', async () => {
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue('denied');
    await expect(getContacts()).rejects.toThrow('Contacts permission denied');
  });

  it('should skip permission check on iOS', async () => {
    Platform.OS = 'ios';
    (Contacts.getAll as jest.Mock).mockResolvedValue(mockContacts);
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue('token');
    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({
        data: {
          registeredUsers: ['5551234567', '1234567890'],
          unRegisteredusers: ['+18005551212'],
        },
      }),
    });
    const result = await getContacts();
    expect(PermissionsAndroid.request).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: 200,
      data: {
        registeredUsers: ['5551234567', '1234567890'],
        unRegisteredusers: ['+18005551212'],
      },
    });
  });
});
