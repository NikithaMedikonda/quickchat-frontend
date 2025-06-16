import EncryptedStorage from 'react-native-encrypted-storage';
import {API_URL} from '../constants/api';
import {insertToLocalDB} from '../database/services/syncFromRemoteDB';

export const syncFromRemote = async (phoneNumber: string) => {
  try {
    const authToken = await EncryptedStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('Missing Authentication key. Authorization failed');
    }
    const response = await fetch(`${API_URL}/api/user/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({phoneNumber}),
    });
    if (response.status !== 200) {
      throw new Error('Error while Syncing chats.');
    }
    const data = await response.json();
    await insertToLocalDB(data.chats, phoneNumber);
  } catch (error) {
    throw new Error(
      `Error while fetching messages from remote: ${(error as Error).message}`,
    );
  }
};
