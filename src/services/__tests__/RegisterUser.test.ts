import { API_URL } from '../../constants/api';
import { registerUser } from '../RegisterUser';

global.fetch = jest.fn();

const mockedFetch = fetch as jest.Mock;

describe('registerUser', () => {
  const payload = {
    image: 'image.jpg',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '9876543210',
    password: 'Test@1234',
    email: 'test@example.com',
  };

  const userData = {
    phoneNumber: '9876543210',
    firstName: 'Test',
    lastName: 'User',
    profilePicture: 'image.jpg',
    email: 'test@example.com',
    password: 'Test@1234',
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

    const result = await registerUser(payload);

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith(`${API_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    expect(result.status).toBe(200);
    expect(result.data).toEqual(mockResponse);
  });

  it('should handle error response', async () => {
    const mockErrorResponse = { message: 'User already exists' };

    mockedFetch.mockResolvedValueOnce({
      status: 409,
      json: jest.fn().mockResolvedValue(mockErrorResponse),
    });

    const result = await registerUser(payload);

    expect(result.status).toBe(409);
    expect(result.data).toEqual(mockErrorResponse);
  });

  it('should throw if fetch fails', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Network Error'));

    await expect(registerUser(payload)).rejects.toThrow('Network Error');
  });
});
