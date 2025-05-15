global.fetch = jest.fn();

import {API_URL} from '../../constants/api';
import {editProfile} from '../editProfile';

const mockedFetch = fetch as jest.Mock;

describe('editProfile', () => {
  const payload = {
     phoneNumber:'9876543210',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    image: 'image.jpg',
    token:'qhgdasvggqvejgwejDSGBQEFUY'
  };
  const user = {
    phoneNumber:'9876543210',
    firstName: 'Test1',
    lastName: 'User1',
    email: 'test@example1.com',
    image: 'image1.jpg',
  };

  const userData = {
    phoneNumber:'9876543210',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    profilePicture: 'image.jpg',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send a POST request with correct data and return response', async () => {
    const mockResponse = {
      accessToken: 'fake-jwt',
      refreshToken: 'fake-refresh',
      user: {
        phoneNumber:'9876543210',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        profilePicture: 'image.jpg',
        isDeleted: false,
      },
    };

    mockedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponse),
    } as any);

    const result = await editProfile(payload, user);

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith(`${API_URL}/api/user`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json',authorization: `Bearer ${payload.token}`},
      body: JSON.stringify(userData),
    });

    expect(result.status).toBe(200);
    expect(result.data).toEqual(mockResponse);
  });
   it('should throw if fetch fails', async () => {
      mockedFetch.mockRejectedValueOnce(new Error('Network Error'));
      await expect(editProfile(payload,user)).rejects.toThrow('Network Error');
    });
});
