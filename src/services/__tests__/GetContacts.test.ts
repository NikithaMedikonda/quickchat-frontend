import {Alert} from 'react-native';
import Contacts from 'react-native-contacts';
import {API_URL} from '../../constants/api';
import {getContacts} from '../GetContacts';

jest.mock('react-native-contacts', () => ({
  getAll: jest.fn(),
}));

global.fetch = jest.fn();
Alert.alert = jest.fn();

describe('getContacts', () => {
  const mockContacts = [
    {
      phoneNumbers: [{number: '(555) 123-4567'}, {number: '123-456-7890'}],
    },
    {
      phoneNumbers: [{number: '+1 (800)555-1212'}],
    },
  ];

  const formattedNumbers = ['5551234567', '1234567890', '+18005551212'];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch contacts and send cleaned phone numbers to the API', async () => {
    (Contacts.getAll as jest.Mock).mockResolvedValue(mockContacts);
    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({
        registeredUsers: ['5551234567', '1234567890'],
        unRegisteredusers: ['+18005551212'],
      }),
    });
    const result = await getContacts();

    expect(Contacts.getAll).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(`${API_URL}/api/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

  it('should throw error if fetch fails', async () => {
    (Contacts.getAll as jest.Mock).mockResolvedValue(mockContacts);
    (fetch as jest.Mock).mockRejectedValueOnce('Network failed');
    await expect(getContacts()).rejects.toThrow('Network failed');
  });
});
