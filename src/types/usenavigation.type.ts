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
  'profileScreen'
>;

type HomeStackParams = {
  hometabs: undefined;
};
export type HomeTabsProps = NativeStackNavigationProp<HomeStackParams, 'hometabs'>;

