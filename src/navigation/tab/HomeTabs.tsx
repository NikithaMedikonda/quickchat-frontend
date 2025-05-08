import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeScreen} from '../../screens/HomeScreen/HomeScreen';
import {ProfileScreen} from '../../screens/ProfileScreen/ProfileScreen';
import {styles} from './HomeTabs.styles';
import {useThemeColors} from '../../constants/colors';
import {UnreadScreen} from '../../screens/UnreadScreen/UnreadScreen';
import {View, Image} from 'react-native';

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
        component={HomeScreen}
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
        component={UnreadScreen}
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
        component={ProfileScreen}
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
