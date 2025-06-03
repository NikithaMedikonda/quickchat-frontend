import Contacts, {Contact} from 'react-native-contacts';
import EncryptedStorage from 'react-native-encrypted-storage';
import {API_URL} from '../constants/api';
import {ONE_DAY_MS} from '../constants/constants';
import {normalise} from '../helpers/normalisePhoneNumber';

export const getContacts = async (hardRefresh: boolean) => {
  const cachedNumbers = await EncryptedStorage.getItem('contact-numbers');
  if (cachedNumbers && !hardRefresh) {
    const {ts, data} = JSON.parse(cachedNumbers);
    if (Date.now() - ts < ONE_DAY_MS) {
      return data;
    }
  }
  try {
    const devicePhoneBook: Contact[] = await Contacts.getAllWithoutPhotos();
    const numbers = new Set<string>();
    devicePhoneBook.forEach((contact: Contact) =>
      contact.phoneNumbers.forEach(phoneNumberDetails =>
        numbers.add(normalise(phoneNumberDetails.number)),
      ),
    );
    const authToken = await EncryptedStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('Missing Authentication key. Authorization failed');
    }
    const response = await fetch(`${API_URL}/api/users/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify([...numbers]),
    });
    if (!response.ok) {
      throw new Error(
        `Server responded ${response.status}. Please try again later.`,
      );
    }
    const {data} = await response.json();
    await EncryptedStorage.setItem(
      'contact-numbers',
      JSON.stringify({ts: Date.now(), data: data}),
    );
    return data;
  } catch (error) {
    throw new Error(
      `Error while fetching Contacts : ${(error as Error).message}`,
    );
  }
};
