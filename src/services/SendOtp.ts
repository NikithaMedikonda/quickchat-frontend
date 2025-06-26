import {API_URL} from '../constants/api';

export const sendOtp = async (phoneNumber: string, name: string, email: string) => {
  try {
    const response = await fetch(`${API_URL}/api/register/otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({phoneNumber,name, email}),
    });
    return response.status;
  } catch (error) {
    throw new Error(`${(error as Error).message}`);
  }
};


export const sendLoginOtp = async (name: string, email: string) => {
  try {
    const response = await fetch(`${API_URL}/api/login/otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({name, email}),
    });
    if (response.status === 200) {
      return true;
    }
    return false;
  } catch (error) {
    throw new Error(`${(error as Error).message}`);
  }
};


