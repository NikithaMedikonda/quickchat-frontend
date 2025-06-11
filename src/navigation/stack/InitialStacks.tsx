import {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useDispatch} from 'react-redux';
import {API_URL} from '../../constants/api';
import {hide, show} from '../../store/slices/loadingSlice';
import {HomeTabs} from '../tab/HomeTabs';
import {LoadingComponent} from '../../components/Loading/Loading';
import {Login} from '../../screens/Login/Login';
import {Registration} from '../../screens/Registration/Registration';
import {setLoginSuccess} from '../../store/slices/loginSlice';
import {Welcome} from '../../screens/Welcome/Welcome';
import {useSocketConnection} from '../../hooks/useSocketConnection';

const Stack = createNativeStackNavigator();

export const InitialStacks = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const {isConnected} = useSocketConnection();
  const dispatch = useDispatch();
  useEffect(() => {
    const getUser = async () => {
      dispatch(show());

      const userString = await EncryptedStorage.getItem('user');
      const accessToken = await EncryptedStorage.getItem('authToken');
      const refreshToken = await EncryptedStorage.getItem('refreshToken');

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
          await EncryptedStorage.clear();
          setInitialRoute('welcome');
          dispatch(hide());
          return;
        }

        if (result.message === 'Access token valid') {
          setInitialRoute('hometabs');
          dispatch(hide());
        }

        if (result.message === 'New access token issued') {
          await EncryptedStorage.setItem('authToken', result.accessToken);
          await EncryptedStorage.setItem('refreshToken', result.refreshToken);
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
      } catch (error) {
        setInitialRoute('welcome');
      } finally {
        dispatch(hide());
      }
    };
    if (isConnected) {
      getUser();
    } else {
      dispatch(show());
      async function checkUserHasToken() {
        const userString = await EncryptedStorage.getItem('user');
        const accessToken = await EncryptedStorage.getItem('authToken');
        const refreshToken = await EncryptedStorage.getItem('refreshToken');
        if(!userString || !accessToken || !refreshToken){
          setInitialRoute('welcome');
          dispatch(hide());
        }else{
        setInitialRoute('hometabs');
        dispatch(hide());
        }
      }
      checkUserHasToken();
    }
  }, [dispatch, isConnected]);

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
        component={Login}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};
