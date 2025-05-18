import {Dimensions, Image, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {styles} from './HomeTabs.styles';
import {Unread} from '../../screens/Unread/Unread';
import {useThemeColors} from '../../constants/colors';
import {useTranslation} from 'react-i18next';
import {HomeStacks} from '../stack/HomeStacks';
import {ProfileStack} from '../stack/ProfileStacks';
import {useImagesColors} from '../../constants/images';
const {height} = Dimensions.get('window');

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
          height: height * 0.1,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          paddingTop: 5,
        },
      }}>
      <Tab.Screen
        name="homeStacks"
        component={HomeStacks}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
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
          tabBarLabel: t('All Chats'),
          headerShown: false,
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
