import { syncFromRemote } from '../syncFromRemote'; // adjust the path
import EncryptedStorage from 'react-native-encrypted-storage';
import { insertToLocalDB } from '../../database/services/syncFromRemoteDB';

jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('../../database/services/syncFromRemoteDB', () => ({
  insertToLocalDB: jest.fn(),
}));

global.fetch = jest.fn();

const mockInsertToLocalDB = insertToLocalDB as jest.MockedFunction<typeof insertToLocalDB>;

describe('syncFromRemote', () => {
  const phoneNumber = '+916303961097';
  const mockToken = 'mocked-auth-token';
  const mockChats = [{ id: 'chat1', Messages: [] }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error if auth token is missing', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    await expect(syncFromRemote(phoneNumber)).rejects.toThrow(
      'Missing Authentication key. Authorization failed',
    );

    expect(fetch).not.toHaveBeenCalled();
    expect(mockInsertToLocalDB).not.toHaveBeenCalled();
  });

  it('should throw error if response is not 200', async () => {
     (EncryptedStorage.getItem as jest.Mock).mockResolvedValueOnce(mockToken);
    (fetch as jest.Mock).mockResolvedValueOnce({ status: 500 });

    await expect(syncFromRemote(phoneNumber)).rejects.toThrow(
      'Error while Syncing chats.',
    );

    expect(mockInsertToLocalDB).not.toHaveBeenCalled();
  });

  it('should throw error if fetch throws', async () => {
     (EncryptedStorage.getItem as jest.Mock).mockResolvedValueOnce(mockToken);
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await expect(syncFromRemote(phoneNumber)).rejects.toThrow(
      'Error while fetching messages from remote: Network error',
    );

    expect(mockInsertToLocalDB).not.toHaveBeenCalled();
  });

  it('should fetch and sync messages successfully', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValueOnce(mockToken);
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({ chats: mockChats }),
    });

    await syncFromRemote(phoneNumber);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/user/messages'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({ phoneNumber }),
      }),
    );

    expect(mockInsertToLocalDB).toHaveBeenCalledWith(mockChats, phoneNumber);
  });
});
