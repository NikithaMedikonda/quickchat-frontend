import {useLayoutEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {Text,View} from 'react-native';
import {HomeTabsProps} from '../../types/usenavigation.type';

import {useThemeColors} from '../../constants/colors';

export const Home = () => {
  const navigation = useNavigation<HomeTabsProps>();
  const colors = useThemeColors();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Quick Chat',
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTitleStyle: {
        color: colors.white,
      },
    });
  });
  return (
    <View>
      <Text>Hello home</Text>
    </View>
  );
};
