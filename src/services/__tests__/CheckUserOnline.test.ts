import { API_URL } from '../../constants/api';
import { checkUserOnline } from '../CheckUserOnline';

global.fetch = jest.fn();
const mockedFetch = fetch as jest.Mock;
describe('check user online', () => {
  const payload = {
    phoneNumber: '9866349126',
    authToken: 'token',
  };
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('should return the success status code upon successful fetching ', async () => {
    const mockResponse = {
      socketId: 'dummy_id',
    };
    mockedFetch.mockResolvedValueOnce({
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponse),
    });
    const result = await checkUserOnline(payload);
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith(`${API_URL}/api/users/online`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer token`,
      },
      body: JSON.stringify({phoneNumber:payload.phoneNumber}),
    });
    expect(result.status).toBe(200);
    expect(result.data).toEqual(mockResponse);
  });
});
