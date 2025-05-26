import {API_URL} from '../constants/api';

export const loginUser = async (payload: {
  phoneNumber: string;
  password: string;
}) => {
  const userData = {
    phoneNumber: payload.phoneNumber,
    password: payload.password,
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
