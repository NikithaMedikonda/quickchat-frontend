import EncryptedStorage from 'react-native-encrypted-storage';
import {API_URL} from '../constants/api';

export const getUserByPhoneNumber = async (
  phoneNumber: string,
): Promise<{profilePicture: string; publicKey: string} | null> => {
  const token = await EncryptedStorage.getItem('authToken');
  if (!token) {
    return null;
  }

  const response = await fetch(`${API_URL}/api/user/${phoneNumber}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return {
    profilePicture: data.user.profilePicture,
    publicKey: data.user.publicKey,
  };
};
