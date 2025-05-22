import EncryptedStorage from 'react-native-encrypted-storage';
import { API_URL } from '../constants/api';
export const getMessagesBetween = async (payload: {
  senderPhoneNumber: string;
  receiverPhoneNumber: string;
}) => {
  const token = await EncryptedStorage.getItem('authToken');
  const {senderPhoneNumber, receiverPhoneNumber} = payload;
  const userData = {
    senderPhoneNumber: senderPhoneNumber,
    receiverPhoneNumber: receiverPhoneNumber,
  };
  const messages = await fetch(`${API_URL}/api/users/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  const data = await messages.json();
  return {
    status: messages.status,
    data,
  };
};
