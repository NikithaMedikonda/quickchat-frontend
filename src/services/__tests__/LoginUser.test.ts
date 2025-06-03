import {API_URL} from '../../constants/api';
import {loginUser} from '../LoginUser';
global.fetch = jest.fn();
const mockedFetch = fetch as jest.Mock;

describe('loginUser', () => {
  const payload = {
    phoneNumber: '9876543210',
    password: 'Test@1234',
  };
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a user with correct data and return response', async () => {
    const mockResponse = {
      accessToken: 'fake-jwt',
      refreshToken: 'fake-refresh',
      user: {
        id: 'some-id',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '9876543210',
        email: 'test@example.com',
        profilePicture: 'image.jpg',

        isDeleted: false,
      },
    };

    mockedFetch.mockResolvedValueOnce({
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponse),
    });
    const result = await loginUser(payload, '29u38');
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith(`${API_URL}/api/user`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({...payload, deviceId: '29u38'}),
    });

    expect(result.status).toBe(200);
    expect(result.data).toEqual(mockResponse);
  });

  it('should handle error response', async () => {
    const mockErrorResponse = {
      message: `User doesn't exists with this phone number`,
    };

    mockedFetch.mockResolvedValueOnce({
      status: 404,
      json: jest.fn().mockResolvedValue(mockErrorResponse),
    });

    const result = await loginUser(payload,'34324');

    expect(result.status).toBe(404);
    expect(result.data).toEqual(mockErrorResponse);
  });

  it('should throw if fetch fails', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Network Error'));

    await expect(loginUser(payload,'1234')).rejects.toThrow('Network Error');
  });
});
