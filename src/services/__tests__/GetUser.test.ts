import { getUserByPhoneNumber } from '../GetUser';

const mockGetItem = require('react-native-encrypted-storage').default.getItem;
const API_URL = require('../../constants/api').API_URL;

jest.mock('react-native-encrypted-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
  },
}));

describe('getUserByPhoneNumber', () => {
  const phoneNumber = '1234567890';

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('returns null if no token is found', async () => {
    mockGetItem.mockResolvedValueOnce(null);
    const result = await getUserByPhoneNumber(phoneNumber);
    expect(result).toBeNull();
    expect(mockGetItem).toHaveBeenCalledWith('authToken');
  });

  it('returns null if fetch response is not ok', async () => {
    mockGetItem.mockResolvedValueOnce('token123');
    global.fetch = jest.fn().mockResolvedValueOnce({ok: false});
    const result = await getUserByPhoneNumber(phoneNumber);
    expect(result).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/user/${phoneNumber}`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer token123',
        }),
      }),
    );
  });

  it('returns user data if fetch is successful', async () => {
    mockGetItem.mockResolvedValueOnce('token123');
    const mockData = {
      user: {
        profilePicture: 'pic.png',
        publicKey: 'pubkey',
      },
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockData),
    });
    const result = await getUserByPhoneNumber(phoneNumber);
    expect(result).toEqual({
      profilePicture: 'pic.png',
      publicKey: 'pubkey',
    });
  });

  it('returns null if fetch throws error', async () => {
    mockGetItem.mockResolvedValueOnce('token123');
    global.fetch = jest.fn().mockResolvedValue({response: {ok: false}});
    const result = await getUserByPhoneNumber(phoneNumber);
    expect(result).toBeNull();
  });

  it('returns null if response JSON is malformed', async () => {
    mockGetItem.mockResolvedValueOnce('token123');
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({user:{}}),
    });
    const result = await getUserByPhoneNumber(phoneNumber);
    expect(result).toEqual({
      profilePicture: undefined,
      publicKey: undefined,
    });
  });
});
