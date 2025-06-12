import EncryptedStorage from 'react-native-encrypted-storage';
import {API_URL} from '../constants/api';

export const getAllChats = async () => {
  try {
    const authToken = await EncryptedStorage.getItem('authToken');
    if (!authToken) {
      return {status: 401};
    }

    const userDetails = await EncryptedStorage.getItem('user');
    if (!userDetails) {
      return {data: null};
    }

    const parsedUserDetails = JSON.parse(userDetails);
    const userPhoneNumber = parsedUserDetails.phoneNumber;

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
  } catch {
    return {
      status: 500,
      data: {message: 'Internal error fetching chats.'},
    };
  }
};

export const getMissedChats = async (lastSyncedAt: string) => {
  try {
    const authToken = await EncryptedStorage.getItem('authToken');
    if (!authToken) {
      return {status: 401};
    }

    const userDetails = await EncryptedStorage.getItem('user');
    if (!userDetails) {
      return {data: null};
    }

    const parsedUserDetails = JSON.parse(userDetails);
    const userPhoneNumber = parsedUserDetails.phoneNumber;
    const response = await fetch(`${API_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({userPhoneNumber,lastSyncedAt}),
    });

    const data = await response.json();

    return {
      status: response.status,
      data:data.data,
    };
  } catch {
    return {
      status: 500,
      data: {message: 'Internal error fetching chats.'},
    };
  }
};
