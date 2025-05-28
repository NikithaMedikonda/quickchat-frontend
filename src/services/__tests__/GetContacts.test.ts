import {getContacts} from '../getContacts';
import EncryptedStorage from 'react-native-encrypted-storage';
import {PermissionsAndroid} from 'react-native';
import Contacts from 'react-native-contacts';
import { ONE_DAY_MS } from '../../constants/constants';

jest.mock('react-native-contacts', () => ({
  getAllWithoutPhotos: jest.fn(),
}));

jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('react-native', () => ({
  PermissionsAndroid: {
    check: jest.fn(),
    request: jest.fn(),
    PERMISSIONS: {READ_CONTACTS: 'READ_CONTACTS'},
    RESULTS: {GRANTED: 'granted'},
  },
  Platform: {OS: 'android'},
}));

global.fetch = jest.fn();
global.Date.now = jest.fn();

describe('Tests for getContacts function', () => {
  const mockContactList = [
    {
      displayName: 'Anoosha Sanugulaaa',
      phoneNumbers: [{number: '9440058809'}],
    },
    {
      displayName: 'USHA SRI',
      phoneNumbers: [{number: '6303961097'}],
    },
    {
      displayName: 'User A',
      phoneNumbers: [{number: '6303552765'}],
    },
    {
      displayName: 'User B',
      phoneNumbers: [{number: '6303974914'}],
    },
    {
      displayName: 'User C',
      phoneNumbers: [{number: '8523997413'}],
    },
    {
      displayName: 'User D',
      phoneNumbers: [{number: '8074537732'}],
    },
    {
      displayName: 'User E',
      phoneNumbers: [{number: '8074537731'}],
    },
    {
      displayName: 'User F',
      phoneNumbers: [{number: '8074537732'}],
    },
  ];

  const mockApiResponse = {
    registeredUsers: [
      {
        name: 'Anoosha Sanugulaaa',
        phoneNumber: '+919440058809',
        profilePicture: 'https://profile.com/anoosha',
      },
      {
        name: 'USHA SRI',
        phoneNumber: '+916303961097',
        profilePicture: 'https://profile.com/ushasi',
      },
    ],
    unRegisteredUsers: [
      '+916303552765',
      '+916303974914',
      '8523997413',
      '8074537732',
      '+918074537732',
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (Date.now as jest.Mock).mockReturnValue(1000000);
  });

  it('returns cached contacts if hardRefresh is false and cache is fresh', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        ts: 1000000 - ONE_DAY_MS + 1000,
        data: mockApiResponse,
      }),
    );
    (global.fetch as jest.Mock) = jest.fn();

    const result = await getContacts(false);
    expect(result).toEqual(mockApiResponse);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should do api call if hardRefresh is true and cache is still fresh', async () => {
    (EncryptedStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(JSON.stringify({ts: 1000000 - ONE_DAY_MS + 1000}))
      .mockResolvedValueOnce('dummyToken');

    (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);
    (Contacts.getAllWithoutPhotos as jest.Mock).mockResolvedValue(
      mockContactList,
    );

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({data: mockApiResponse}),
    });

    const result = await getContacts(true);
    expect(result).toEqual(mockApiResponse);
    expect(fetch).toHaveBeenCalled();
  });

   it('should do api call if hardRefresh is true also no cache', async () => {
    (EncryptedStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(JSON.stringify({ts: 1000000 - ONE_DAY_MS - 1000}))
      .mockResolvedValueOnce('dummyToken');

    (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);
    (Contacts.getAllWithoutPhotos as jest.Mock).mockResolvedValue(
      mockContactList,
    );

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({data: mockApiResponse}),
    });

    const result = await getContacts(true);
    expect(result).toEqual(mockApiResponse);
    expect(fetch).toHaveBeenCalled();
  });


  it('should requests permission if not granted', async () => {
    (EncryptedStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(JSON.stringify({ts: 1000000 - ONE_DAY_MS - 1000}))
      .mockResolvedValueOnce('dummyToken');

    (PermissionsAndroid.check as jest.Mock).mockResolvedValue(false);
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue('granted');

    (Contacts.getAllWithoutPhotos as jest.Mock).mockResolvedValue(
      mockContactList,
    );

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({data: mockApiResponse}),
    });

    const result = await getContacts(true);
    expect(result).toEqual(mockApiResponse);
  });

  it('should throw error if permission is denied', async () => {
    (PermissionsAndroid.check as jest.Mock).mockResolvedValue(false);
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue('denied');
    await expect(getContacts(true)).rejects.toThrow(
      'Contacts permission denied',
    );
  });

  it('should throw error if auth token is missing', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);
    (Contacts.getAllWithoutPhotos as jest.Mock).mockResolvedValue(
      mockContactList,
    );
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    await expect(getContacts(true)).rejects.toThrow(
      'Missing Authentication key. Authorization failed',
    );
  });

  it('throws error if API returns non-ok response', async () => {
    (EncryptedStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('dummyToken');

    (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);
    (Contacts.getAllWithoutPhotos as jest.Mock).mockResolvedValue(
      mockContactList,
    );

    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(getContacts(true)).rejects.toThrow(
      'Server responded 500. Please try again later',
    );
  });
});