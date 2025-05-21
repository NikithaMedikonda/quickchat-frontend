import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {ContactsDisplay} from '../../screens/ContactsDisplay/ContactsDisplay';
import {Home} from '../../screens/Home/Home';
import {IndividualChat} from '../../screens/IndividualChat/IndividualChat';
import {HomeStackParamList} from '../../types/usenavigation.type';

const Stack = createNativeStackNavigator<HomeStackParamList>();
export const HomeStacks = () => {
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
