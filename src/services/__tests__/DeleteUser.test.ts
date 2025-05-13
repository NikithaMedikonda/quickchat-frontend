import {API_URL} from '../../constants/api';
import {deleteUser} from '../DeleteUser';

global.fetch = jest.fn();

const mockedFetch = fetch as jest.Mock;

describe('registerUser', () => {
  const phoneNumber = '9876543210';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send a POST request with correct data and return response', async () => {
    mockedFetch.mockResolvedValueOnce({
      status: 200,
      json: jest
        .fn()
        .mockResolvedValue({message: 'Account deleted succesfully'}),
    });

    const result = await deleteUser(phoneNumber);

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith(`${API_URL}/api/deleteAccount`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(phoneNumber),
    });

    expect(result.status).toBe(200);
    expect(result.data).toEqual({message: 'Account deleted succesfully'});
  });

  it('should handle error response', async () => {
    mockedFetch.mockResolvedValueOnce({
      status: 404,
      json: jest.fn().mockResolvedValue({message: 'Invalid phone number'}),
    });

    const result = await deleteUser(phoneNumber);

    expect(result.status).toBe(404);
    expect(result.data).toEqual({message: 'Invalid phone number'});
  });

  it('should throw if fetch fails', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Network Error'));

    await expect(deleteUser(phoneNumber)).rejects.toThrow('Network Error');
  });
});
