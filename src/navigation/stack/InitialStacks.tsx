import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {WelcomeScreen} from '../../screens/WelcomeScreen/WelcomeScreen';
import RegisterScreen from '../../screens/RegisterScreen/RegisterScreen';
import {HomeTabs} from '../tab/HomeTabs';

const Stack = createNativeStackNavigator();

export const InitialStacks = () => {
  return (
    <Stack.Navigator initialRouteName="welcome">
      <Stack.Screen
        name="welcome"
        component={WelcomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="hometabs"
        component={HomeTabs}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="register"
        component={RegisterScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};
