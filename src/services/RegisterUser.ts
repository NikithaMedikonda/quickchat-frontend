import {API_URL} from '../constants/api';

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
  const response = await fetch(`${API_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  return {
    status: response.status,
    data,
  };
};
