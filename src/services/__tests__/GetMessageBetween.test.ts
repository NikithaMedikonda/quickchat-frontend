import EncryptedStorage from 'react-native-encrypted-storage';
import {API_URL} from '../../constants/api';
import {getMessagesBetween} from '../GetMessagesBetween';
global.fetch = jest.fn();
const mockedFetch = fetch as jest.Mock;
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));
describe('getMessagesbetween two users', () => {
  const payload = {
    senderPhoneNumber: '+918522041688',
    receiverPhoneNumber: '+919866349126',
  };
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('should return the success status code upon successful fetching ', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue('token');
    const mockResponse = {
      chats: [
        {
          sender: {
            phoneNumber: '+918522041688',
          },
          receiver: {
            phoneNumber: '+919866349126',
          },
          content: 'Hii',
          status: 'delivered',
        },
      ],
    };
    mockedFetch.mockResolvedValueOnce({
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponse),
    });
    const result = await getMessagesBetween(payload);
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith(`${API_URL}/api/users/messages`, {
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
