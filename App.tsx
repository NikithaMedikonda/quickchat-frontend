import React, {useEffect} from 'react';
import SplashScreen from 'react-native-splash-screen';
import {NativeRouter, Routes, Route} from 'react-router-native';
import {WelcomeScreen} from './src/screens/WelcomeScreen/WelcomeScreen';
import {Registration} from './src/screens/Registration/Registration.tsx';
import {Provider} from 'react-redux';
import {store} from './src/store/store';

const App = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <Provider store={store}>
    <NativeRouter>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="register" element={<Registration/>} />
      </Routes>
    </NativeRouter>
  </Provider>  );
};

export default App;
