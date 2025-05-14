import { API_URL } from '../constants/api';

export const registerUser = async (payload: {
  image: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  email: string;
}) => {
  const userData = {
    phoneNumber: payload.phoneNumber,
    firstName: payload.firstName,
    lastName: payload.lastName,
    profilePicture: payload.image,
    email: payload.email,
    password: payload.password,
  };

  try {
    const response = await fetch(`${API_URL}/api/users`, {
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
  } catch (error) {
    throw error;
  }
};
