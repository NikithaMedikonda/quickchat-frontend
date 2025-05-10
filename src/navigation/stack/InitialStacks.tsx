import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeTabs} from '../tab/HomeTabs';
import {Registration} from '../../screens/Registration/Registration';
import {Welcome} from '../../screens/Welcome/Welcome';

const Stack = createNativeStackNavigator();

export const InitialStacks = () => {
  return (
    <Stack.Navigator initialRouteName="welcome">
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
