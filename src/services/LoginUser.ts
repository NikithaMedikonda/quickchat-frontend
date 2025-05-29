import {API_URL} from '../constants/api';

export const loginUser = async (
  form: { phoneNumber: string; password: string },
  deviceId: string
) => {
  const userData = {
    ...form,
    deviceId,
  };

  const response = await fetch(`${API_URL}/api/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  return {
    status: response.status,
    data,
  };
};

