import {API_URL} from '../constants/api';

export const verifyUserDetails = async (
  phoneNumber: string,
  password: string,
) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({phoneNumber, password}),
    });
    const data = await response.json();
    return {
      status: response.status,
      isLogin: data.isLogin,
      name: data.name,
      email: data.email,
    };
  } catch (error) {
    throw new Error(`${(error as Error).message}`);
  }
};
