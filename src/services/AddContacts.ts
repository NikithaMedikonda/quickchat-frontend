import {API_URL} from '../constants/api';
import { UserContacts } from '../types/contacts.types';

export const addContacts = async ({
  currentUserPhoneNumber,
  contacts,
  authToken,
}: {
  currentUserPhoneNumber: string;
  contacts: UserContacts[];
  authToken: string;
}) => {
  console.log('Adding contacts to remote server', contacts);
  const response = await fetch(`${API_URL}/api/user/contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      ownerPhoneNumber: currentUserPhoneNumber,
      contactDetails: contacts,
    }),
  });
  console.log('Response from server:', response);
  if (response.status === 200) {
    return {
      status: 'success',
    };
  } else {
    return {
      status: 'Failed to add contacts',
    };
  }
};
