import React, {useEffect} from 'react';
import SplashScreen from 'react-native-splash-screen';
import {NativeRouter, Routes, Route} from 'react-router-native';
import {Provider} from 'react-redux';
import { WelcomeScreen } from './src/screens/Welcome/Welcome';
import { Registration } from './src/screens/Registration/Registration';
import {store} from './src/store/store';
import {LoadingComponent} from './src/components/Loading/Loading';

export const App = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <Provider store={store}>
    <NativeRouter>
      <LoadingComponent/>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/register" element={<Registration/>} />
      </Routes>
    </NativeRouter>
  </Provider>

  );
};
