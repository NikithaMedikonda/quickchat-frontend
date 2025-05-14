import Contacts from 'react-native-contacts';
import {API_URL} from '../constants/api';

export const getContacts = async () => {
  const phoneContacts = await Contacts.getAll();
  let allContacts: string[] = [];
  phoneContacts.forEach(contact => {
    contact.phoneNumbers.forEach(phone => {
      const phoneNumber = phone.number.replace(/[\s()-]/g, '');
      allContacts.push(phoneNumber);
    });
  });

  try {
    const response = await fetch(`${API_URL}/api/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(allContacts),
    });
    const data = await response.json();
    return {
      status: response.status,
      data,
    };
  } catch (error) {
    throw new Error(`${error}`);
  }
};
