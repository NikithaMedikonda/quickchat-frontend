import { Image, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home } from '../../screens/Home/Home';
import { Profile } from '../../screens/Profile/Profile';
import { styles } from './HomeTabs.styles';
import { Unread } from '../../screens/Unread/Unread';
import { useThemeColors } from '../../constants/colors';

export const HomeTabs = () => {
  const Tab = createBottomTabNavigator();
  const colors = useThemeColors();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.background,
        },
      }}>
      <Tab.Screen
        name="home"
        component={Home}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({focused}) => (
            <View style={styles.iconContainer}>
              {!focused && (
                <Image
                  source={require('../../assets/home.png')}
                  style={styles.icon}
                />
              )}
              {focused && (
                <Image
                  source={require('../../assets/highlight-home.png')}
                  style={styles.icon}
                />
              )}
            </View>
          ),
          tabBarLabel: 'Chats',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleAlign: 'center',
          headerTitle: 'Quick Chat',
          headerTitleStyle: {
            color: colors.white,
          },
        }}
      />
      <Tab.Screen
        name="unread"
        component={Unread}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({focused}) => (
            <View style={styles.iconContainer}>
              {!focused && (
                <Image
                  source={require('../../assets/unread-message.png')}
                  style={styles.icon}
                />
              )}
              {focused && (
                <Image
                  source={require('../../assets/highlight-unread-message.png')}
                  style={styles.icon}
                />
              )}
            </View>
          ),
          tabBarLabel: 'Unread Chats',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleAlign: 'center',
          headerTitle: 'Quick Chat',
          headerTitleStyle: {
            color: colors.white,
          },
        }}
      />
      <Tab.Screen
        name="profile"
        component={Profile}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({focused}) => (
            <View style={styles.iconContainer}>
              {!focused && (
                <Image
                  source={require('../../assets/user.png')}
                  style={styles.profileIcon}
                />
              )}
              {focused && (
                <Image
                  source={require('../../assets/highlight-user.png')}
                  style={styles.profileIcon}
                />
              )}
            </View>
          ),
          tabBarLabel: 'Profile',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleAlign: 'center',
          headerTitle: 'Profile',
          headerTitleStyle: {
            color: colors.white,
          },
        }}
      />
    </Tab.Navigator>
  );
};
