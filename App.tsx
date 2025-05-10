import React, {useEffect} from 'react';
import SplashScreen from 'react-native-splash-screen';
import {InitialStacks} from './src/navigation/stack/InitialStacks';
import { NavigationContainer } from '@react-navigation/native';
import * as RNLocalize from 'react-native-localize';
import {i18next} from './src/i18n/i18n.config';
import {Provider} from 'react-redux';
import { WelcomeScreen } from './src/screens/Welcome/Welcome';
import { Registration } from './src/screens/Registration/Registration';
import {store} from './src/store/store';
import LoadingComponent from './src/components/LoadingComponent/LoadingComponent'; // Adjust the path as needed

export const App = () => {
export const App = () => {
  useEffect(() => {
    SplashScreen.hide();
    const languageCode = RNLocalize.getLocales()[0].languageCode || 'en';
    i18next.changeLanguage(languageCode);
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
      <InitialStacks />
        <LoadingComponent />
    </NavigationContainer>
    </Provider>
  );
};
