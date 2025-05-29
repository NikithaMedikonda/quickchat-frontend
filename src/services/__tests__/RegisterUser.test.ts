import {API_URL} from '../../constants/api';
import {keyEncryption} from '../KeyEncryption';
import {registerUser} from '../RegisterUser';

global.fetch = jest.fn();

const mockedFetch = fetch as jest.Mock;

jest.mock('react-native-libsodium', () => ({
  crypto_box_keypair: jest.fn(),
  to_base64: jest.fn((input: Uint8Array) =>
    Buffer.from(input).toString('base64'),
  ),
  crypto_generichash: jest.fn(() => new Uint8Array(32).fill(1)),
  crypto_secretbox_easy: jest.fn(() => new Uint8Array(64).fill(2)),
  randombytes_buf: jest.fn(() => new Uint8Array(24).fill(3)),
}));

jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn(),
}));

describe('registerUser', () => {
  const payload = {
    image: 'image.jpg',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '9876543210',
    password: 'Test@1234',
    email: 'test@example.com',
  };

  const keys = {
    publicKey: 'mock-publicKey',
    privateKey: 'mock-privateKey',
  };
  const deviceId = {
    deviceId: 'gfjdaskjhskqdhgfcdsvjbk',
  };
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send a POST request with correct data and return response', async () => {
    const encryptedPrivateKey = await keyEncryption({
      privateKey: keys.privateKey,
      password: payload.password,
    });

    const userData = {
      phoneNumber: '9876543210',
      firstName: 'Test',
      lastName: 'User',
      profilePicture: 'image.jpg',
      email: 'test@example.com',
      password: 'Test@1234',
      publicKey: keys.publicKey,
      privateKey: encryptedPrivateKey,
      deviceId: deviceId.deviceId,
    };

    const mockResponse = {
      accessToken: 'fake-jwt',
      refreshToken: 'fake-refresh',
      user: {
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '9876543210',
        password: 'Test@1234',
        email: 'test@example.com',
        profilePicture: payload.image,
        isDeleted: false,
        publicKey: keys.publicKey,
        privateKey: encryptedPrivateKey,
        deviceId: deviceId.deviceId,
      },
    };

    mockedFetch.mockResolvedValueOnce({
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await registerUser(payload, keys, deviceId);

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith(`${API_URL}/api/users`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(userData),
    });

    expect(result.status).toBe(200);
    expect(result.data).toEqual(mockResponse);
  });

  it('should handle error response', async () => {
    const mockErrorResponse = {message: 'User already exists'};

    mockedFetch.mockResolvedValueOnce({
      status: 409,
      json: jest.fn().mockResolvedValue(mockErrorResponse),
    });

    const result = await registerUser(payload, keys, deviceId);

    expect(result.status).toBe(409);
    expect(result.data).toEqual(mockErrorResponse);
  });

  it('should assign empty object if response.json() throws', async () => {
    mockedFetch.mockResolvedValueOnce({
      status: 200,
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    });

    const result = await registerUser(payload, keys, deviceId);

    expect(result.status).toBe(200);
    expect(result.data).toEqual({});
  });

  it('should throw if fetch fails', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Network Error'));

    await expect(registerUser(payload, keys, deviceId)).rejects.toThrow(
      'Network Error',
    );
  });
});
