import React, { useLayoutEffect } from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { useThemeColors } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { HomeTabsProps } from '../../types/usenavigation.type';
import { getStyles } from './PlusIcon.styles';
import { useImagesColors } from '../../constants/images';

const PlusIcon = () => {
  const navigation = useNavigation<HomeTabsProps>();
  const {homeAdd} = useImagesColors();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Quick Chat',
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTitleStyle: {
        color: colors.text,
      },
    });
  });
  return (
    <TouchableOpacity style={styles.innerContainer} onPress={() => navigation.navigate('contacts')}>
      <Image
        style={styles.plusImage}
        source={homeAdd}
        accessibilityHint="plus-image"
      />
    </TouchableOpacity>
  );
};

export default PlusIcon;
