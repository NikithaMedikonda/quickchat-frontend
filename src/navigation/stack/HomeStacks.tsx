import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ContactsDisplay} from '../../screens/ContactsDisplay/ContactsDisplay';
import {Home} from '../../screens/Home/Home';

const Stack = createNativeStackNavigator();

export const HomeStacks = () => {
  return (
    <Stack.Navigator initialRouteName={'home'}>
      <Stack.Screen
        name="home"
        component={Home}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="contacts"
        component={ContactsDisplay}
        options={{headerShown: true}}
      />
    </Stack.Navigator>
  );
};
