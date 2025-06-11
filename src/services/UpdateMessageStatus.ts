import EncryptedStorage from 'react-native-encrypted-storage';
import { API_URL } from '../constants/api';
export const updateMessageStatus = async (payload: {
  senderPhoneNumber: string;
  receiverPhoneNumber: string;
  previousStatus: string;
  currentStatus: string;
}) => {
  const token = await EncryptedStorage.getItem('authToken');
  const {senderPhoneNumber, receiverPhoneNumber, previousStatus,currentStatus} = payload;
  const messageData = {
    senderPhoneNumber,
    receiverPhoneNumber,
    previousStatus,
    currentStatus,
  };
  const messages = await fetch(`${API_URL}/api/messages/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(messageData),
  });
  const data = await messages.json();
  return {
    status: messages.status,
    data,
  };
};
