import {waitFor} from '@testing-library/react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {API_URL} from '../../constants/api';
import {getAllChats} from '../GetAllChats';

jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(),
}));

global.fetch = jest.fn();

const mockedFetch = fetch as jest.Mock;

describe('Tests for get all chats fucntion', () => {
  const mockUserDetails = {
    id: '14c9dda3-9a94-4f87-8b16-1669c0e818c3',
    firstName: 'Sujji',
    lastName: 'Medikonda',
    profilePicture:
      'https://sdjetntpocezxjoelxgb.supabase.co/storage/v1/object/public/quick-chat/images/image-1748234020702.jpg',
    email: 'sujji@gmail.com',
    phoneNumber: '+919248434816',
    isDeleted: false,
    publicKey: 'N_7RfEGqKSyeoM89jgfequ4ZGTHTMEW88NJHB8SkgWg',
    privateKey:
      '{"nonce":"swStvn4-qEVY7PYh5FlsEM5P8db35bw3","encrypted":"0II41LKOoXyH_hDkqG7-2yPxaumWuPbJCSeB_t1NShYPkiKjBmAwqeJwG1TxfLAB9dejBF09VLkuJ-Q"}',
    socketId: null,
  };

  const mockChats = [
    {
      chatId: 'f1a8e140-0a40-4050-a77e-8624fb5603e0',
      contactName: 'receiver B',
      contactProfilePic: null,
      lastMessageStatus: null,
      lastMessageText: 'Your welcome.',
      lastMessageTimestamp: '2025-05-26T15:05:00.000Z',
      lastMessageType: 'receivedMessage',
      phoneNumber: '+916303552762',
      unreadCount: 1,
    },
    {
      chatId: '753da16b-ffd4-4884-bf2e-9db4600924d7',
      contactName: 'sender A',
      contactProfilePic: null,
      lastMessageStatus: 'sent',
      lastMessageText: 'Hello, I am giving reply to you!',
      lastMessageTimestamp: '2025-05-26T14:55:00.000Z',
      lastMessageType: 'sentMessage',
      phoneNumber: '+916303974914',
      unreadCount: 2,
    },
    {
      chatId: '29be6ac2-8ec3-4663-abf7-84fc2092a2a9',
      contactName: 'receiver A',
      contactProfilePic: null,
      lastMessageStatus: 'read',
      lastMessageText: 'Thanks for giving reply!',
      lastMessageTimestamp: '2025-05-14T14:45:00.000Z',
      lastMessageType: 'sentMessage',
      phoneNumber: '+916303552761',
      unreadCount: 1,
    },
    {
      chatId: '29be6ac2-8ec3-4663-abf7-84fc2092a2a9',
      contactName: 'receiver C',
      contactProfilePic: null,
      lastMessageStatus: 'delivered',
      lastMessageText: 'Thanks for giving reply!',
      lastMessageTimestamp: '2025-05-14T14:45:00.000Z',
      lastMessageType: 'sentMessage',
      phoneNumber: '+916303552761',
      unreadCount: 1,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Fetch all contacts', async () => {
    (EncryptedStorage.getItem as jest.Mock)
      .mockResolvedValueOnce('dummy-token')
      .mockResolvedValueOnce(JSON.stringify(mockUserDetails));

    mockedFetch.mockResolvedValueOnce({
      status: 200,
      json: jest.fn().mockResolvedValue(mockChats),
    });

    const result = await getAllChats();

    await waitFor(() => {
      expect(EncryptedStorage.getItem).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${API_URL}/api/chats/user`),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            authorization: 'Bearer dummy-token',
          }),
          body: JSON.stringify({userPhoneNumber: mockUserDetails.phoneNumber}),
        }),
      );
      expect(result.data).toEqual(mockChats);
    });
  });

  test('Missing authToken returns 401', async () => {
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const result = await getAllChats();

    expect(result.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  test('Missing userDetails returns 401', async () => {
    (EncryptedStorage.getItem as jest.Mock)
      .mockResolvedValueOnce('dummy-token')
      .mockResolvedValueOnce(null);

    const result = await getAllChats();

    expect(result.data).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  test('Handles fetch error gracefully', async () => {
    (EncryptedStorage.getItem as jest.Mock)
      .mockResolvedValueOnce('dummy-token')
      .mockResolvedValueOnce(JSON.stringify(mockUserDetails));

    mockedFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await getAllChats();

    expect(result.status).toBe(500);
    expect(result.data).toEqual({
      message: 'Internal error fetching chats.',
    });
  });
});
