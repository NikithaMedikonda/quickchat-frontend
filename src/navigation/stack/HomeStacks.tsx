import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Home} from '../../screens/Home/Home';
import {ContactsDisplay} from '../../screens/ContactsDisplay/ContactsDisplay';

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
