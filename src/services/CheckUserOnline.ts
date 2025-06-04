import {API_URL} from '../constants/api';

export const checkUserOnline = async (payload: {
  phoneNumber: string;
  requestedUserPhoneNumber: string;
  authToken: string;
}) => {
  const response = await fetch(`${API_URL}/api/users/online`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${payload.authToken}`,
    },
    body: JSON.stringify({
      phoneNumber: payload.phoneNumber,
      requestedUserPhoneNumber: payload.requestedUserPhoneNumber,
    }),
  });
  const data = await response.json();
  return {
    status: response.status,
    data,
  };
};
