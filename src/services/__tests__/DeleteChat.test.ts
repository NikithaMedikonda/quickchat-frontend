import { API_URL } from '../../constants/api';
import { deleteChat } from '../DeleteChat'; 

global.fetch = jest.fn();
const mockedFetch = fetch as jest.Mock;

describe('deleteChat', () => {
  const payload = {
    senderPhoneNumber: '9876543210',
    receiverPhoneNumber: '1234567890',
    timestamp: 1716900000000,
    authToken: 'test-token',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send POST request and return status/data on success', async () => {
    const mockResponse = { message: 'Chat deleted successfully' };

    mockedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await deleteChat(payload);

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith(`${API_URL}/api/chat/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${payload.authToken}`,
      },
      body: JSON.stringify({
        senderPhoneNumber: payload.senderPhoneNumber,
        receiverPhoneNumber: payload.receiverPhoneNumber,
        timestamp: payload.timestamp,
      }),
    });

    expect(result.status).toBe(200);
    expect(result.data).toEqual(mockResponse);
  });

  it('should throw an error with message from response if response is not ok', async () => {
    const errorMessage = 'Chat not found';

    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: jest.fn().mockResolvedValue({ message: errorMessage }),
    });

    await expect(deleteChat(payload)).rejects.toThrow(errorMessage);
  });

  it('should throw generic error if JSON parsing fails', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    });

    await expect(deleteChat(payload)).rejects.toThrow('Failed to delete conversation');
  });

  it('should throw if fetch itself fails', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Network Error'));

    await expect(deleteChat(payload)).rejects.toThrow('Network Error');
  });
});
