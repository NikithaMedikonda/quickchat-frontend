import {API_URL} from '../../constants/api';
import { blockUser } from '../UserBlock';

global.fetch = jest.fn();

const mockedFetch = fetch as jest.Mock;

describe('blockUser', () => {
  const payload = {blockerPhoneNumber: '9876543210',blockedPhoneNumber:'1234567890', authToken: '24234'};

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send a POST request with correct data and return response', async () => {
    mockedFetch.mockResolvedValueOnce({
      status: 200,
      json: jest
        .fn()
        .mockResolvedValue({message: 'Account unblock succesfully'}),
    });

    const result = await blockUser(payload);

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith(`${API_URL}/api/block/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': 'Bearer 24234',
      },
      body: JSON.stringify({blockerPhoneNumber:payload.blockerPhoneNumber,blockedPhoneNumber:payload.blockedPhoneNumber}),
    });

    expect(result.status).toBe(200);
  });

  it('should handle error response', async () => {
    mockedFetch.mockResolvedValueOnce({
      status: 404,
      json: jest.fn().mockResolvedValue({message: 'Invalid phone number'}),
    });

    const result = await blockUser(payload);

    expect(result.status).toBe(404);
    expect(result.data).toEqual({message: 'Invalid phone number'});
  });

  it('should throw if fetch fails', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Network Error'));

    await expect(blockUser(payload)).rejects.toThrow('Network Error');
  });
});
