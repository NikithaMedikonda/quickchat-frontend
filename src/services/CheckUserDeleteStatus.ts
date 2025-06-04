import {API_URL} from '../constants/api';

export const CheckUserDeleteStatus = async ({
  phoneNumber,
  authToken,
}: {
  phoneNumber: string;
  authToken: string;
}) => {
  const response = await fetch(`${API_URL}/api/users/deleted`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      phoneNumber: phoneNumber,
    }),
  });
  const data = await response.json();
  return {
    status: response.status,
    data,
  };
};
