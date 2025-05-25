import {API_URL} from '../../constants/api';
import {updateProfile} from '../UpdateProfile';

global.fetch = jest.fn();
const mockedFetch = fetch as jest.Mock;

describe('Test for editProfile service', () => {
  const payload = {
    phoneNumber: '9440058809',
    firstName: 'Anoosha',
    lastName: 'Sanugula',
    email: 'anu@gmail.com',
    image: 'img.jpg',
    token: 'qhgdasvggqvejgwejDSGBQEFUY',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send PUT request with all changed fields', async () => {
    const user = {
      phoneNumber: '9440058809',
      firstName: 'Goldie',
      lastName: 'S',
      email: 'goldie@gmail.com',
      image: 'image.jpg',
    };

    const mockResponse = {success: true};
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await updateProfile(payload, user);

    expect(mockedFetch).toHaveBeenCalledWith(`${API_URL}/api/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${payload.token}`,
      },
      body: JSON.stringify({
        phoneNumber: payload.phoneNumber,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        profilePicture: payload.image,
      }),
    });

    expect(result.status).toBe(200);
    expect(result.data).toEqual(mockResponse);
  });

  it('should only include phoneNumber if no fields have changed', async () => {
    const user = {
      phoneNumber: '9440058809',
      firstName: 'Anoosha',
      lastName: 'Sanugula',
      email: 'anu@gmail.com',
      image: 'img.jpg',
    };

    const mockResponse = {success: true};
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await updateProfile(payload, user);

    expect(mockedFetch).toHaveBeenCalledWith(`${API_URL}/api/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${payload.token}`,
      },
      body: JSON.stringify({
        phoneNumber: payload.phoneNumber,
      }),
    });

    expect(result.status).toBe(200);
    expect(result.data).toEqual(mockResponse);
  });

  it('should throw if fetch fails', async () => {
    const user = {
      phoneNumber: '9440058809',
      firstName: 'Goldie',
      lastName: 'S',
      email: 'goldie@gmail.com',
      image: 'image.jpg',
    };

    mockedFetch.mockRejectedValueOnce(new Error('Network Error'));

    await expect(updateProfile(payload, user)).rejects.toThrow('Network Error');
  });
  it('should not include phoneNumber if it has changed', async () => {
    const changedUser = {
      phoneNumber: '8503458907',
      firstName: 'Goldie',
      lastName: 'S',
      email: 'goldie@gmail.com',
      image: 'image.jpg',
    };

    const expectedBody = {
      firstName: 'Anoosha',
      lastName: 'Sanugula',
      email: 'anu@gmail.com',
      profilePicture: 'img.jpg',
    };

    const mockResponse = {success: true};
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await updateProfile(payload, changedUser);

    expect(mockedFetch).toHaveBeenCalledWith(`${API_URL}/api/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${payload.token}`,
      },
      body: JSON.stringify(expectedBody),
    });

    expect(result.status).toBe(200);
    expect(result.data).toEqual(mockResponse);
  });
});
