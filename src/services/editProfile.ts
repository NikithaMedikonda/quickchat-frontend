import { API_URL } from '../constants/api';

export const editProfile = async (
  payload: {
    image: string;
    firstName: string;
    lastName: string;
    email: string;
  },
  user: {
    image?: string;
    firstName: string;
    lastName: string;
    email: string;
  }
) => {
  const userData: any = {};

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

  try {
    const response = await fetch(`${API_URL}/api/update`, {
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
