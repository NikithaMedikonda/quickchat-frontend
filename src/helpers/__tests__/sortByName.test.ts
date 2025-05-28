import {ContactDetails} from '../../types/contact.types';
import {sortByName} from '../sortByName';

describe('test for sortByName function', () => {
  it('should sort contacts by name in ascending order (case-insensitive)', () => {
    const contacts: ContactDetails[] = [
      {
        phoneNumber: '+916303961097',
        name: 'Usha',
        profilePicture: '',
        toBeInvited: false,
      },
      {
        phoneNumber: '+916303974914',
        name: 'Mamatha',
        profilePicture: '',
        toBeInvited: false,
      },
      {
        phoneNumber: '+918074537732',
        name: 'Achyuth',
        profilePicture: '',
        toBeInvited: false,
      },
    ];

    const sortedContacts = sortByName(contacts);
    expect(sortedContacts).toEqual([
      {
        phoneNumber: '+918074537732',
        name: 'Achyuth',
        profilePicture: '',
        toBeInvited: false,
      },
      {
        phoneNumber: '+916303974914',
        name: 'Mamatha',
        profilePicture: '',
        toBeInvited: false,
      },
      {
        phoneNumber: '+916303961097',
        name: 'Usha',
        profilePicture: '',
        toBeInvited: false,
      },
    ]);
  });
});
