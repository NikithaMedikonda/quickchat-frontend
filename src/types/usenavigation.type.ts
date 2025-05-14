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

type HomeStackParams = {
  hometabs: undefined;
  contacts:undefined;
};
export type HomeTabsProps = NativeStackNavigationProp<HomeStackParams, 'hometabs','contacts'>;

