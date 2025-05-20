import Contacts from 'react-native-contacts';
import {API_URL} from '../constants/api';
import EncryptedStorage from 'react-native-encrypted-storage';
import {PermissionsAndroid, Platform} from 'react-native';


export const getContacts = async () => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Contacts Permission',
          message: 'This app needs access to your contacts',
          buttonPositive: 'OK',
        },
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error('Contacts permission denied');
      }
    }
    const phoneContacts = await Contacts.getAll();
    let allContacts: string[] = [];
    phoneContacts.forEach(contact => {
      contact.phoneNumbers.forEach(phone => {
        const phoneNumber = phone.number.replace(/[\s()-]/g, '');
        allContacts.push(phoneNumber);
      });
    });
    const authToken = await EncryptedStorage.getItem('authToken');
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
