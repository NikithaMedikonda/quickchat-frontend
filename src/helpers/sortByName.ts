import { ContactDetails } from '../types/contact.types';

export const sortByName = (arr: ContactDetails[]) =>
  [...arr].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {sensitivity: 'base'}),
  );
