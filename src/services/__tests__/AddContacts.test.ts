import { addContacts } from '../AddContacts';
import { API_URL } from '../../constants/api';
import { UserContacts } from '../../types/contacts.types';

global.fetch = jest.fn();
const mockedFetch = fetch as jest.Mock;

describe('addContacts', () => {
  const currentUserPhoneNumber = '1234567890';
  const authToken = 'test-auth-token';

  const contacts: UserContacts[] = [
    {
      savedAs :'Alice',
      phoneNumber: '9876543210',
    },
    {
      savedAs: 'Bob',
      phoneNumber: '8765432109',
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send a POST request and return success for 200 response', async () => {
    mockedFetch.mockResolvedValueOnce({
      status: 200,
    });

    const result = await addContacts({
      currentUserPhoneNumber,
      contacts,
      authToken,
    });

    expect(mockedFetch).toHaveBeenCalledWith(`${API_URL}/api/user/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        ownerPhoneNumber: currentUserPhoneNumber,
        contactDetails: contacts,
      }),
    });

    expect(result).toEqual({ status: 'success' });
  });

  it('should return failure status for non-200 response', async () => {
    mockedFetch.mockResolvedValueOnce({
      status: 500,
    });

    const result = await addContacts({
      currentUserPhoneNumber,
      contacts,
      authToken,
    });

    expect(result).toEqual({ status: 'Failed to add contacts' });
  });

  it('should throw if fetch fails', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Network Error'));

    await expect(
      addContacts({
        currentUserPhoneNumber,
        contacts,
        authToken,
      }),
    ).rejects.toThrow('Network Error');
  });
});
