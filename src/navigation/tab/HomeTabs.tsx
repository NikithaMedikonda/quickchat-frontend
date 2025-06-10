import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  getFocusedRouteNameFromRoute,
  useFocusEffect,
} from '@react-navigation/native';
import {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Image, View} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useDispatch, useSelector} from 'react-redux';
import {Badge} from '../../components/Badge/Badge.tsx';
import {User} from '../../screens/Profile/Profile';
import {getAllChats} from '../../services/GetAllChats.ts';
import {newSocket, socketConnection} from '../../socket/socket';
import {
  setNewMessageCount,
  setUnreadCount,
} from '../../store/slices/unreadChatSlice.ts';
import {useThemeColors} from '../../themes/colors';
import {useImagesColors} from '../../themes/images';
import {HomeStacks} from '../stack/HomeStacks';
import {ProfileStack} from '../stack/ProfileStacks';
import {UnreadStacks} from '../stack/UnreadStacks.tsx';
import {styles} from './HomeTabs.styles';

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
  const unreadCount = useSelector((state: any) => state.unread?.count ?? 0);
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
      {unreadCount > 0 && (
        <View style={styles.unreadCount}>
          <Badge messageCount={unreadCount} />
        </View>
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
  const [newMessageCount, setMessageCount] = useState(0);
  const dispatch = useDispatch();
  useEffect(() => {
    const handleNewMessage = (data: any) => {
      if (data.newMessage) {
        setMessageCount(prevCount => prevCount + 1);
      }
    };

    newSocket.on('new_message', handleNewMessage);

    return () => {
      newSocket.off('new_message', handleNewMessage);
    };
  }, [dispatch, newMessageCount]);
  useEffect(() => {
    async function connect() {
      const user = await EncryptedStorage.getItem('user');
      if (user) {
        const parsedUser: User = JSON.parse(user);
        await socketConnection(parsedUser.phoneNumber);
      }
    }
    connect();
    return () => {
      newSocket.disconnect();
    };
  }, []);
  useFocusEffect(
    useCallback(() => {
      const fetchChats = async () => {
        const response = await getAllChats();
        if (response.status === 200) {
          const allChats = response.data.chats;
          const unreadChats = allChats.filter(
            (chat: {unreadCount: number}) => chat.unreadCount > 0,
          );

          const totalUnreadChats = unreadChats.length;
          dispatch(setUnreadCount(totalUnreadChats));
        }
      };
      dispatch(setNewMessageCount(newMessageCount));
      fetchChats();
    }, [dispatch, newMessageCount]),
  );
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
        component={UnreadStacks}
        options={({route}) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? '';
          const hideTabBar = routeName === 'individualChat';
          return {
            headerShown: false,
            tabBarIcon: UnreadTabIcon,
            tabBarLabel: t('Unread Chats'),
            headerStyle: {backgroundColor: colors.background},
            headerTitleAlign: 'center',
            tabBarStyle: {
              display: hideTabBar ? 'none' : 'flex',
              backgroundColor: colors.background,
              height: 100,
              borderTopWidth: 0,
            },
          };
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
