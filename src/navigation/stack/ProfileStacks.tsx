import React from 'react';
import {useTranslation} from 'react-i18next';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Profile} from '../../screens/Profile/Profile';
import {EditProfile} from '../../screens/EditProfile/EditProfile';
import {useThemeColors} from '../../constants/colors';

const Stack = createNativeStackNavigator();

export const ProfileStack = () => {
  const colors = useThemeColors();
  const {t} = useTranslation('auth');
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="profileScreen"
        component={Profile}
        options={{
          title: t('Profile'),
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleAlign: 'center',
          headerTitleStyle: {
            color: colors.white,
          },
          headerBackVisible:false,
        }}
      />
      <Stack.Screen
        name="editProfile"
        component={EditProfile}
        options={{
          title: t('Edit Profile'),
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleAlign: 'center',
          headerTitleStyle: {
            color: colors.white,
          },
        }}
      />
    </Stack.Navigator>
  );
};
