import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import * as enStart from './translations/english/start.json';
import * as teStart from './translations/telugu/start.json';
import * as enAuth from './translations/english/auth.json';
import * as teAuth from './translations/telugu/auth.json';
import * as enHome from './translations/english/home.json';
import * as teHome from './translations/telugu/home.json';
import * as enProfile from './translations/english/profile.json';
import * as teProfile from './translations/telugu/profile.json';
import * as teContact from './translations/telugu/contact.json';
import * as enContact from './translations/english/contact.json';
import * as enIndividualChat from './translations/english/individualChat.json';
import * as teIndividualChat from './translations/telugu/individualChat.json';

export const resources = {
  en: {
    start: enStart,
    auth: enAuth,
    home: enHome,
    profile: enProfile,
    contact: enContact,
    individualChat: enIndividualChat,
  },
  te: {
    start: teStart,
    auth: teAuth,
    home: teHome,
    profile: teProfile,
    contact: teContact,
    individualChat: teIndividualChat,
  },
};

const languageCode = RNLocalize.getLocales()[0]?.languageCode;

i18next.use(initReactI18next).init({
  debug: true,
  fallbackLng: 'en',
  resources: resources,
  ns: ['start', 'auth', 'home', 'contact','individualChat'],
  lng: languageCode,
});

export {i18next};
