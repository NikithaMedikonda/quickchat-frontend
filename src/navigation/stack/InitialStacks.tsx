import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeTabs} from '../tab/HomeTabs';
import {Registration} from '../../screens/Registration/Registration';
import {Welcome} from '../../screens/Welcome/Welcome';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { show,hide } from '../../store/slices/loadingSlice';
import { LoadingComponent } from '../../components/Loading/Loading';

const Stack = createNativeStackNavigator();

export const InitialStacks = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const dispatch = useDispatch();
  useEffect(() => {
    const getUser = async () => {
      dispatch(show());
      const user = await AsyncStorage.getItem('user');
      setInitialRoute(user ? 'hometabs' : 'welcome');
      dispatch(hide());
    };
    getUser();
  }, [dispatch]);

  if(initialRoute === null){
    return (
      <LoadingComponent/>
    );
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen
        name="welcome"
        component={Welcome}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="hometabs"
        component={HomeTabs}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="register"
        component={Registration}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="login"
        component={Welcome}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};
