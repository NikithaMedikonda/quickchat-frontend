import {API_URL} from '../constants/api';

export const deleteChat = async ({
  senderPhoneNumber,
  receiverPhoneNumber,
  timestamp,
  authToken,
}: {
  senderPhoneNumber: string;
  receiverPhoneNumber: string;
  timestamp: number;
  authToken: string;
}) => {
  const response = await fetch(`${API_URL}/api/chat/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      senderPhoneNumber,
      receiverPhoneNumber,
      timestamp,
    }),
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = {message: 'Failed to delete conversation'};
    }
    throw new Error(errorData.message);
  }
  const data = await response.json();
  return {
    status: response.status,
    data,
  };
};
