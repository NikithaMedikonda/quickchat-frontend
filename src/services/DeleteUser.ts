import {API_URL} from '../constants/api';

export const deleteUser = async (phoneNumber: string) => {
  const response = await fetch(`${API_URL}/api/deleteAccount`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(phoneNumber),
  });
  const data = await response.json();
  console.log('data in the delete user');
  return {
    status: response.status,
    data,
  };
};
