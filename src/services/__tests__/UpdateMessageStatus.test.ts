import EncryptedStorage from 'react-native-encrypted-storage';
import { API_URL } from '../../constants/api';
import { updateMessageStatus } from '../UpdateMessageStatus';
global.fetch = jest.fn();
const mockedFetch = fetch as jest.Mock;
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));
describe('update message status', () => {
  const payload = {
    senderPhoneNumber: '+918522041688',
    receiverPhoneNumber: '+919866349126',
    timestamp: '2025-05-13T12:00:00',
    previousStatus: 'delivered',
    currentStatus: 'read',
  };
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('should return the success status code upon successful fetching ', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue('token');
    const mockResponse = {
      count: 1,
      message: 'Updated',
    };
    mockedFetch.mockResolvedValueOnce({
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponse),
    });
    const result = await updateMessageStatus(payload);
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith(`${API_URL}/api/messages/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer token`,
      },
      body: JSON.stringify(payload),
    });
    expect(result.status).toBe(200);
    expect(result.data).toEqual(mockResponse);
  });
});
