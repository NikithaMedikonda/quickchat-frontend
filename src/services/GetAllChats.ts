import EncryptedStorage from 'react-native-encrypted-storage';
import {API_URL} from '../constants/api';

export const getAllChats = async () => {
  try {
    const authToken = await EncryptedStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('Authorization failed');
    }

    const userDetails = await EncryptedStorage.getItem('user');

    let userPhoneNumber;
    if (userDetails) {
      const userDetailsParsed = JSON.parse(userDetails);
      userPhoneNumber = userDetailsParsed.phoneNumber;
    }

    const response = await fetch(`${API_URL}/api/chats/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({userPhoneNumber}),
    });
    const data = await response.json();
    return {
      status: response.status,
      data,
    };
  } catch (error) {
    throw new Error(`Error while fetching chats ${(error as Error).message}`);
  }
};
