import React, {useEffect} from 'react';
import SplashScreen from 'react-native-splash-screen';
import {InitialStacks} from './src/navigation/stack/InitialStacks';
import { NavigationContainer } from '@react-navigation/native';

export const App = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <NavigationContainer>
      <InitialStacks />
    </NavigationContainer>
  );
};
