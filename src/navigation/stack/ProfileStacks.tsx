import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {EditProfile} from '../../screens/EditProfile/EditProfile';
import {Profile} from '../../screens/Profile/Profile';
import {useThemeColors} from '../../themes/colors';

const Stack = createNativeStackNavigator();

export const ProfileStack = () => {
  const colors = useThemeColors();
  const {t} = useTranslation('auth');
  return (
    <Stack.Navigator initialRouteName="profileScreen">
      <Stack.Screen
        name="profileScreen"
        component={Profile}
        options={{
          title: t('Profile Screen'),
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleAlign: 'center',
          headerTitleStyle: {
            color: colors.text,
          },
          headerBackVisible:false,
        }}
      />
      <Stack.Screen
        name="editProfileScreen"
        component={EditProfile}
        options={{
          title: t('Edit Profile'),
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleAlign: 'center',
          headerTitleStyle: {
            color: colors.text,
          },
        }}
      />
    </Stack.Navigator>
  );
};
