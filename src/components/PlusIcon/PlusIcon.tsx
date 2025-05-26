import {useLayoutEffect} from 'react';
import {TouchableOpacity, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getStyles} from './PlusIcon.styles';
import {HomeTabsProps} from '../../types/usenavigation.type';
import {useImagesColors} from '../../themes/images';
import {useThemeColors} from '../../themes/colors';

export const PlusIcon = () => {
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
    <TouchableOpacity
      style={styles.innerContainer}
      onPress={() => navigation.navigate('contacts')}>
      <Image
        style={styles.plusImage}
        source={homeAdd}
        accessibilityHint="plus-image"
      />
    </TouchableOpacity>
  );
};

 