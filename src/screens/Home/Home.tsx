import {useLayoutEffect} from 'react';
import {Image, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {HomeTabsProps} from '../../types/usenavigation.type';
import {useThemeColors} from '../../themes/colors';
import {getStyles} from './Home.styles';
import {PlusIcon} from '../../components/PlusIcon/PlusIcon';
import { useDeviceCheck } from '../../services/useDeviceCheck';

export const Home = () => {
  const navigation = useNavigation<HomeTabsProps>();
   useDeviceCheck();
  const colors = useThemeColors();
  const {t} = useTranslation('auth');
  const styles = getStyles(colors);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'QuickChat',
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
    <View style={styles.container}>
    <View style={styles.imageContainer}>
      <Image
        style={styles.gif}
        source={require('./../../assets/homescreen.png')}
      />
      <Text style={styles.description}>
        {t('Start messages text')}
      </Text>
      <Text style={styles.description}>
        {t('User friendly question')}
      </Text>
    </View>
    <View style={styles.plusContainer}>
      <PlusIcon />
    </View>
  </View>
  );
};
