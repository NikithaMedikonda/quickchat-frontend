import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useEffect} from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import {ContactsDisplay} from '../../screens/ContactsDisplay/ContactsDisplay';
import {Home} from '../../screens/Home/Home';
import {IndividualChat} from '../../screens/IndividualChat/IndividualChat';
import {User} from '../../screens/Profile/Profile';
import {socketConnection} from '../../socket/socket';
import {HomeStackParamList} from '../../types/usenavigation.type';
const Stack = createNativeStackNavigator<HomeStackParamList>();
export const HomeStacks = () => {
  useEffect(() => {
    async function connect() {
      const user = await EncryptedStorage.getItem('user');
      if (user) {
        const parsedUser: User = JSON.parse(user);
        await socketConnection(parsedUser.phoneNumber);
      }
    }
    connect();
  }, []);
  return (
    <Stack.Navigator initialRouteName={'home'}>
      <Stack.Screen
        name="home"
        component={Home}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="individualChat"
        component={IndividualChat}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="contacts"
        component={ContactsDisplay}
        options={{headerShown: true}}
      />
    </Stack.Navigator>
  );
};
