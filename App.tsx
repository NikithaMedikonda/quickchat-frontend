import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import * as RNLocalize from 'react-native-localize';
import SplashScreen from 'react-native-splash-screen';
import { Provider } from 'react-redux';
import { LoadingComponent } from './src/components/Loading/Loading';
import { getDBInstance } from './src/database/connection/connection';
import { createTables } from './src/database/models/schema';
import './src/i18n/i18n.config';
import { i18next } from './src/i18n/i18n.config';
import { InitialStacks } from './src/navigation/stack/InitialStacks';
import { store } from './src/store/store';

export const App = () => {
  useEffect(() => {
    SplashScreen.hide();
    const languageCode = RNLocalize.getLocales()[0].languageCode;
    i18next.changeLanguage(languageCode);

    const initialiseDB = async () => {
      const databaseInstance = await getDBInstance();
      await createTables(databaseInstance);
    };
    initialiseDB();
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
