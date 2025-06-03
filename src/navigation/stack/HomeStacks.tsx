import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useEffect} from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import {AllChats} from '../../screens/AllChats/AllChats';
import {ContactsDisplay} from '../../screens/ContactsDisplay/ContactsDisplay';
import {IndividualChat} from '../../screens/IndividualChat/IndividualChat';
import {User} from '../../screens/Profile/Profile';
import {socketConnection} from '../../socket/socket';
import {HomeStackParamList} from '../../types/usenavigation.type';


const Stack = createNativeStackNavigator<HomeStackParamList>();
export const HomeStacks = () => {
  return (
    <Stack.Navigator initialRouteName={'home'}>
      <Stack.Screen
        name="home"
        component={AllChats}
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
