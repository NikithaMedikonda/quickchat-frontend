import React, { useEffect } from 'react';
import SplashScreen from 'react-native-splash-screen';
import { NativeRouter, Routes, Route } from 'react-router-native';
import {WelcomeScreen} from './src/screens/WelcomeScreen/WelcomeScreen';
import RegisterScreen from './src/screens/RegisterScreen/RegisterScreen';

const App = () => {
  useEffect(() => {
    SplashScreen.hide();
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

export default App;

