import React, { useEffect } from 'react';
import SplashScreen from 'react-native-splash-screen';
import { NativeRouter, Routes, Route } from 'react-router-native';
import {WelcomeScreen} from './src/screens/WelcomeScreen/WelcomeScreen';
import {Registration} from './src/screens/Registration/Registration.tsx';

const App = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <NativeRouter>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="register" element={<Registration/>} />
      </Routes>
    </NativeRouter>
  );
};

export default App;

