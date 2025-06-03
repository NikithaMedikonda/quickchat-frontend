import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserDetails } from './user.types';

type RootStackParamList = {
  register: undefined;
  login: undefined;
};

export type NavigationProps = NativeStackNavigationProp<
  RootStackParamList,
  'register',
  'login'
>;

export type ProfileStackParamList = {
  profileScreen: undefined;
  editProfileScreen: undefined;
};

export type ProfileScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'profileScreen',
  'editProfileScreen'
>;

type HomeStackParams = {
  hometabs: undefined;
  contacts: undefined;
};
export type HomeTabsProps = NativeStackNavigationProp<
  HomeStackParams,
  'hometabs',
  'contacts'
>;
type InitialStackParams = {
  welcome: undefined;
};
export type InitialStackProps = NativeStackNavigationProp<
  InitialStackParams,
  'welcome'
>;
export type HomeStackParamList = {
  home: undefined;
  individualChat: { user: UserDetails };
  contacts: undefined;
};
export type HomeStackProps = NativeStackNavigationProp<
  HomeStackParamList,
  'home',
  'individualChat'
>;

export type UnreadStackParamList = {
  unread: undefined,
  individualChat: { user: UserDetails };
}
export type UnreadStacKProps = NativeStackNavigationProp<
  UnreadStackParamList,
  'unread',
  'individualChat'
>;
