import {API_URL} from '../constants/api';
export const logoutUser = async (payload: {
  phoneNumber: string;
  authToken: string;
}) => {
  const response = await fetch(`${API_URL}/api/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${payload.authToken}`,
    },
    body: JSON.stringify({phoneNumber: payload.phoneNumber}),
  });
  const data = await response.json();
  return {
    status: response.status,
    data,
  };
};
