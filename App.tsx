import React from 'react';
import { NativeRouter, Routes, Route } from 'react-router-native';
import {WelcomeScreen} from './src/screens/WelcomeScreen/WelcomeScreen';
import RegisterScreen from './src/screens/RegisterScreen/RegisterScreen';

const App = () => {
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

