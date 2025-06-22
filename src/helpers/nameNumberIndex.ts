import {PermissionsAndroid, Platform} from 'react-native';
import Contacts from 'react-native-contacts';
import EncryptedStorage from 'react-native-encrypted-storage';
import {normalise} from './normalisePhoneNumber';

export const numberNameIndex = async () => {
  if (Platform.OS === 'android') {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
    );

    if (!hasPermission) {
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
  }

  try {
    const user = await EncryptedStorage.getItem('user');
    if (!user) {
      return null;
    }
    const indexInLocal = await EncryptedStorage.getItem('index');
    const hardRefresh = await EncryptedStorage.getItem('hardRefresh');
    if (indexInLocal && hardRefresh === 'false') {
      return JSON.parse(indexInLocal);
    }
    const myNumber = await JSON.parse(user!).phoneNumber;
    const book = await Contacts.getAllWithoutPhotos();
    const index: Record<string, string> = {};
    book.forEach(contact =>
      contact.phoneNumbers.forEach(phoneNumbeDetails => {
        index[normalise(phoneNumbeDetails.number)] =
          normalise(phoneNumbeDetails.number) !== normalise(myNumber)
            ? contact.givenName || contact.displayName || 'unknown'
            : `${contact.givenName} (You)`;
      }),
    );
    await EncryptedStorage.setItem('index', JSON.stringify(index));
    await EncryptedStorage.setItem('hardRefresh', 'false');
    return index;
  } catch (error) {
    throw new Error(
      `Error while fetching contacts: ${(error as Error).message}`,
    );
  }
};
