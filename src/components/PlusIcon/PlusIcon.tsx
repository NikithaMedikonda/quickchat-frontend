import React, { useLayoutEffect } from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { useThemeColors } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { HomeTabsProps } from '../../types/usenavigation.type';
import { getStyles } from './PlusIcon.styles';

const PlusIcon = () => {
  const navigation = useNavigation<HomeTabsProps>();
  const colors = useThemeColors();
  const styles = getStyles();
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
    <TouchableOpacity style={styles.innerContainer} onPress={() => navigation.navigate('contacts')}>
      <Image
        style={styles.plusImage}
        source={require('../../assets/plus-icon.png')}
        accessibilityHint="plus-image"
      />
    </TouchableOpacity>
  );
};

export default PlusIcon;
