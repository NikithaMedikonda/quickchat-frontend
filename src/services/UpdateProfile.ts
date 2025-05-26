import {API_URL} from '../constants/api';

export const updateProfile = async (
  editProfileForm: {
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
  if (user.phoneNumber === editProfileForm.phoneNumber) {
    userData.phoneNumber = editProfileForm.phoneNumber;
  }
  if (user.firstName !== editProfileForm.firstName) {
    userData.firstName = editProfileForm.firstName;
  }

  if (user.lastName !== editProfileForm.lastName) {
    userData.lastName = editProfileForm.lastName;
  }

  if (user.email !== editProfileForm.email) {
    userData.email = editProfileForm.email;
  }

  if (user.image !== editProfileForm.image) {
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
