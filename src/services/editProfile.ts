import {API_URL} from '../constants/api';

export const editProfile = async (
  payload: {
    phoneNumber: string;
    image: string;
    firstName: string;
    lastName: string;
    email: string;
    token: string;
  },
  user: {
    phoneNumber: string;
    image?: string;
    firstName: string;
    lastName: string;
    email: string;
  },
) => {
  const userData: any = {};
  if (user.phoneNumber === payload.phoneNumber) {
    userData.phoneNumber = payload.phoneNumber;
  }
  if (user.firstName !== payload.firstName) {
    userData.firstName = payload.firstName;
  }

  if (user.lastName !== payload.lastName) {
    userData.lastName = payload.lastName;
  }

  if (user.email !== payload.email) {
    userData.email = payload.email;
  }

  if (user.image !== payload.image) {
    userData.profilePicture = payload.image;
  }

  const response = await fetch(`${API_URL}/api/user`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${payload.token}`,
    },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  return {
    status: response.status,
    data,
  };
};
