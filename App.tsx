import React, { useEffect } from 'react';
import SplashScreen from 'react-native-splash-screen';
import { NativeRouter, Routes, Route } from 'react-router-native';
import {WelcomeScreen} from './src/screens/WelcomeScreen/WelcomeScreen';
import RegisterScreen from './src/screens/RegisterScreen/RegisterScreen';
import './src/i18n/i18n.config'
import * as RNLocalize from 'react-native-localize';
import {i18next} from './src/i18n/i18n.config';


export const App = () => {
  useEffect(() => {
    SplashScreen.hide();
    const languageCode = RNLocalize.getLocales()[0].languageCode || 'en';
    i18next.changeLanguage(languageCode);
  }, []);

  return (
    <NativeRouter>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="register" element={<RegisterScreen />} />
      </Routes>
    </NativeRouter>
  );
};

 

