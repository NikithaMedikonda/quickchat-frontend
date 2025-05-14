import Contacts from 'react-native-contacts';
import {API_URL} from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const authToken = await AsyncStorage.getItem('authToken');
    console.log(authToken);
    if (!authToken) {
      throw new Error('Authorization failed');
    }
    const response = await fetch(`${API_URL}/api/users/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(allContacts),
    });
    const data = await response.json();
    return {
      status: response.status,
      data: data.data,
    };
  } catch (error) {
    throw new Error(`${error}`);
  }
};
