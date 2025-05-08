import React, {useEffect} from 'react';
import SplashScreen from 'react-native-splash-screen';
import {NativeRouter, Routes, Route} from 'react-router-native';
import './src/i18n/i18n.config'
import * as RNLocalize from 'react-native-localize';
import {i18next} from './src/i18n/i18n.config';
import {Provider} from 'react-redux';
import {store} from './src/store/store';
import {WelcomeScreen} from './src/screens/WelcomeScreen/WelcomeScreen';
import RegisterScreen from './src/screens/RegisterScreen/RegisterScreen';


export const App = () => {
  useEffect(() => {
    SplashScreen.hide();
    const languageCode = RNLocalize.getLocales()[0].languageCode || 'en';
    i18next.changeLanguage(languageCode);
  }, []);

  return (
    <Provider store={store}>
      <NativeRouter>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="register" element={<RegisterScreen />} />
        </Routes>
      </NativeRouter>
    </Provider>
  );
};
