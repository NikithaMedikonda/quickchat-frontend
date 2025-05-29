import Contacts from 'react-native-contacts';
import EncryptedStorage from 'react-native-encrypted-storage';
import { normalise } from './normalisePhoneNumber';

export const numberNameIndex = async () => {
  try {
    const user = await EncryptedStorage.getItem('user');
    if (!user) {
      return null;
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
    return index;
  } catch (error) {
    throw new Error(
      `Error while fetching contacts: ${(error as Error).message}`,
    );
  }
};
