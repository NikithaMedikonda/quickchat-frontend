import './src/i18n/i18n.config';
import {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import * as RNLocalize from 'react-native-localize';
import SplashScreen from 'react-native-splash-screen';
import {i18next} from './src/i18n/i18n.config';
import {InitialStacks} from './src/navigation/stack/InitialStacks';
import {LoadingComponent} from './src/components/Loading/Loading';
import {Provider} from 'react-redux';
import {store} from './src/store/store';

export const App = () => {
  useEffect(() => {
    SplashScreen.hide();
    const languageCode = RNLocalize.getLocales()[0].languageCode;
    i18next.changeLanguage(languageCode);
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <LoadingComponent />
        <InitialStacks />
      </NavigationContainer>
    </Provider>
  );
};
