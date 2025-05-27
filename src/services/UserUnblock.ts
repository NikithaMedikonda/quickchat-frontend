import {API_URL} from '../constants/api';

export const unblockUser = async ({
  blockerPhoneNumber,
  blockedPhoneNumber,
  authToken,
}: {
  blockerPhoneNumber: string;
  blockedPhoneNumber: string;
  authToken: string;
}) => {
  const response = await fetch(`${API_URL}/api/unblock/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      blockerPhoneNumber: blockerPhoneNumber,
      blockedPhoneNumber: blockedPhoneNumber,
    }),
  });
  const data = await response.json();
  return {
    status: response.status,
    data,
  };
};
