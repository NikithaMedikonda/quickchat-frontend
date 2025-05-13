import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoadingComponent } from '../../components/Loading/Loading';
import { API_URL } from '../../constants/api';
import { Registration } from '../../screens/Registration/Registration';
import { Welcome } from '../../screens/Welcome/Welcome';
import { hide, show } from '../../store/slices/loadingSlice';
import { setLoginSuccess } from '../../store/slices/loginSlice';
import { HomeTabs } from '../tab/HomeTabs';

const Stack = createNativeStackNavigator();

export const InitialStacks = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const getUser = async () => {
      dispatch(show());

      const userString = await AsyncStorage.getItem('user');
      const accessToken = await AsyncStorage.getItem('authToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      const user = userString ? JSON.parse(userString) : null;


      if (!accessToken || !refreshToken || !user) {
        setInitialRoute('welcome');
        dispatch(hide());
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/validate`, {
          method: 'POST',
          headers: {
            authorization: `Bearer ${accessToken}`,
            'x-refresh-token': refreshToken,
          },
        });

        const result = await response.json();
        if (
          result.message === 'Invalid access token' ||
          result.message === 'Invalid refresh token'
        ) {
          await AsyncStorage.multiRemove(['user', 'authToken', 'refreshToken']);
          setInitialRoute('welcome');
          dispatch(hide());
          return;
        }

        if(result.message === 'Access token valid') {
          setInitialRoute('hometabs');
          dispatch(hide());
        }

        if (result.message === 'New access token issued') {
          await AsyncStorage.setItem('authToken', result.accessToken);
          await AsyncStorage.setItem('refreshToken', result.refreshToken);
        }

          dispatch(
            setLoginSuccess({
              accessToken: result.accessToken,
              refreshToken: result.refreshToken,
              user,
            }),
          );
          setInitialRoute('hometabs');
          dispatch(hide());
        }
       catch (error) {
        setInitialRoute('welcome');
      } finally {
      dispatch(hide());
    }
    };
    getUser();
  }, [dispatch]);

  if (initialRoute === null) {
    return <LoadingComponent />;
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
