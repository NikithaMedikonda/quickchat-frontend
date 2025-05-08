import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import * as enStart from './translations/english/start.json'
import * as teStart from './translations/telugu/start.json'
import * as knStart from './translations/kannada/start.json'
import * as hiStart from './translations/hindi/start.json'
import * as enAuth from './translations/english/auth.json'
import * as teAuth from './translations/telugu/auth.json'
import * as knAuth from './translations/kannada/auth.json'
import * as hiAuth from './translations/hindi/auth.json'

export const resources = {
  en: {
    start: enStart,
    auth:enAuth
  },
  te: {
    start: teStart,
    auth:teAuth
  },
  kn:{
    start:knStart,
    auth:knAuth,
  },
  hi:{
    start:hiStart,
    auth:hiAuth
  }
};


const languageCode = RNLocalize.getLocales()[0]?.languageCode || 'en';

i18next.use(initReactI18next).init({
  debug: true,
  fallbackLng: 'en',
  resources: resources,
  ns: ['start', 'auth'],
  lng: languageCode,
});

export {i18next};