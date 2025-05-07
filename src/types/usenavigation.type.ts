import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type RootStackParamList = {
  register: undefined;
};

export type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'register'
>;
