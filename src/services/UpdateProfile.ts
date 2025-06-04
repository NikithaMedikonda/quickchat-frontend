import {API_URL} from '../constants/api';

export const updateProfile = async (
  editProfileForm: {
    phoneNumber: string;
    image: string;
    firstName: string;
    lastName: string;
    email?: string;
    token: string;
  },
  user: {
    phoneNumber: string;
    profilePicture: string;
    firstName: string;
    lastName: string;
    email?: string;
  },
) => {
  const userData: {
    phoneNumber?: string;
    profilePicture?: string;
    firstName?: string;
    lastName?: string;
    email?: string | null;
  } = {};
  if (user.phoneNumber === editProfileForm.phoneNumber) {
    userData.phoneNumber = editProfileForm.phoneNumber;
  }
  if (user.firstName !== editProfileForm.firstName) {
    userData.firstName = editProfileForm.firstName.trim();
  }

  if (user.lastName !== editProfileForm.lastName) {
    userData.lastName = editProfileForm.lastName.trim();
  }

  if (user.email !== editProfileForm.email) {
    userData.email = editProfileForm.email?.trim() || null;
  }

  if (user.profilePicture !== editProfileForm.image) {
    userData.profilePicture = editProfileForm.image;
  }
  const response = await fetch(`${API_URL}/api/user`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${editProfileForm.token}`,
    },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  return {
    status: response.status,
    data,
  };
};
