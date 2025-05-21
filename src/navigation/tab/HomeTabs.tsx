import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {Image, View} from 'react-native';

import {Unread} from '../../screens/Unread/Unread';
import {useThemeColors} from '../../themes/colors';
import {useImagesColors} from '../../themes/images';
import {HomeStacks} from '../stack/HomeStacks';
import {ProfileStack} from '../stack/ProfileStacks';
import {styles} from './HomeTabs.styles';

export const HomeTabs = () => {
  const Tab = createBottomTabNavigator();
  const colors = useThemeColors();
  const {tabHome, tabUnread, tabProfile} = useImagesColors();
  const {t} = useTranslation('home');
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.background,
          height: 100,
          borderTopWidth: 0,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginTop: 20,
          textAlign: 'center',
        },
      }}>
      <Tab.Screen
        name="homeStacks"
        component={HomeStacks}
        options={({route}) => {
          // Get the current stack screen inside HomeStacks
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'home';
          // Hide tab bar only on individualChat screen
          const hideTabBar = routeName === 'individualChat';
          return {
            headerShown: false,
            tabBarLabel: t('All Chats'),
            tabBarStyle: {
              display: hideTabBar ? 'none' : 'flex',
              backgroundColor: colors.background,
              height: 100,
              borderTopWidth: 0,
            },
            tabBarIcon: ({focused}) => (
              <View style={styles.iconContainer}>
                {!focused && <Image source={tabHome} style={styles.icon} />}
                {focused && (
                  <Image
                    source={require('../../assets/highlight-home.png')}
                    style={styles.icon}
                  />
                )}
              </View>
            ),
          };
        }}
      />
      <Tab.Screen
        name="unread"
        component={Unread}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({focused}) => (
            <View style={styles.iconContainer}>
              {!focused && <Image source={tabUnread} style={styles.icon} />}
              {focused && (
                <Image
                  source={require('../../assets/highlight-unread-message.png')}
                  style={styles.icon}
                />
              )}
            </View>
          ),
          tabBarLabel: t('Unread Chats'),
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleAlign: 'center',
          headerTitle: t('Quick Chat'),
          headerTitleStyle: {
            color: colors.text,
          },
        }}
      />
      <Tab.Screen
        name="profileStack"
        component={ProfileStack}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({focused}) => (
            <View style={styles.iconContainer}>
              {!focused && (
                <Image source={tabProfile} style={styles.profileIcon} />
              )}
              {focused && (
                <Image
                  source={require('../../assets/highlight-user.png')}
                  style={styles.profileIcon}
                />
              )}
            </View>
          ),
          tabBarLabel: t('Profile'),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};
