import {NativeStackNavigationProp} from '@react-navigation/native-stack';

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
  editProfile: undefined;
};

export type ProfileScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'profileScreen',
   'editProfile'
>;

type HomeStackParams = {
  hometabs: undefined;
  contacts:undefined;
};
export type HomeTabsProps = NativeStackNavigationProp<HomeStackParams, 'hometabs','contacts'>;

type InitialStackParams = {
  welcome: undefined;
};
export type InitialStackProps = NativeStackNavigationProp<
  InitialStackParams,
  'welcome'
>;
