global.fetch = jest.fn();

import {API_URL} from '../../constants/api';
import {editProfile} from '../editProfile';

const mockedFetch = fetch as jest.Mock;

describe('editProfile', () => {
  const payload = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    image: 'image.jpg',
  };
  const user = {
    firstName: 'Test1',
    lastName: 'User1',
    email: 'test@example1.com',
    image: 'image1.jpg',
  };

  const userData = {
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
    expect(mockedFetch).toHaveBeenCalledWith(`${API_URL}/api/update`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
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
