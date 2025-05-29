import {Image, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';

import {HomeStacks} from '../stack/HomeStacks';
import {ProfileStack} from '../stack/ProfileStacks';
import {Unread} from '../../screens/Unread/Unread';

import {styles} from './HomeTabs.styles';
import {useThemeColors} from '../../themes/colors';
import {useImagesColors} from '../../themes/images';
import {useTranslation} from 'react-i18next';

const HomeTabIcon = ({focused}: {focused: boolean}) => {
  const {tabHome} = useImagesColors();
  return (
    <View style={styles.iconContainer}>
      {!focused ? (
        <Image source={tabHome} style={styles.icon} />
      ) : (
        <Image
          source={require('../../assets/highlight-home.png')}
          style={styles.icon}
        />
      )}
    </View>
  );
};

const UnreadTabIcon = ({focused}: {focused: boolean}) => {
  const {tabUnread} = useImagesColors();
  return (
    <View style={styles.iconContainer}>
      {!focused ? (
        <Image source={tabUnread} style={styles.icon} />
      ) : (
        <Image
          source={require('../../assets/highlight-unread-message.png')}
          style={styles.icon}
        />
      )}
    </View>
  );
};

const ProfileTabIcon = ({focused}: {focused: boolean}) => {
  const {tabProfile} = useImagesColors();
  return (
    <View style={styles.iconContainer}>
      {!focused ? (
        <Image source={tabProfile} style={styles.profileIcon} />
      ) : (
        <Image
          source={require('../../assets/highlight-user.png')}
          style={styles.profileIcon}
        />
      )}
    </View>
  );
};

export const HomeTabs = () => {
  const Tab = createBottomTabNavigator();
  const colors = useThemeColors();
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
         paddingBlock: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          paddingTop: 20,
          textAlign: 'center',
        },
      }}>
      <Tab.Screen
        name="homeStacks"
        component={HomeStacks}
        options={({route}) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'home';
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
            tabBarIcon: HomeTabIcon,
          };
        }}
      />
      <Tab.Screen
        name="unread"
        component={Unread}
        options={{
          tabBarIcon: UnreadTabIcon,
          tabBarLabel: t('Unread Chats'),
          headerStyle: {backgroundColor: colors.background},
          headerTitleAlign: 'center',
          headerTitle: t('Quick Chat'),
          headerTitleStyle: {color: colors.text},
        }}
      />
      <Tab.Screen
        name="profileStack"
        component={ProfileStack}
        options={{
          headerShown: false,
          tabBarIcon: ProfileTabIcon,
          tabBarLabel: t('Profile'),
        }}
        listeners={({navigation}) => ({
          tabPress: event => {
            event.preventDefault();
            navigation.navigate('profileStack', {
              screen: 'profileScreen',
            });
          },
        })}
      />
    </Tab.Navigator>
  );
};
