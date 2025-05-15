import { Image, Text, View } from 'react-native';
import { getStyles } from './Home.styles';
import { useThemeColors } from '../../constants/colors';
import { useTranslation } from 'react-i18next';

export const Home = () => {
  const colors = useThemeColors();
  const {t} = useTranslation('auth');
  const styles = getStyles(colors);
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.description}>{t('You have no chats. Start Messaging!')}</Text>
      </View>
      <View style={styles.innerContainer}>
       <Image
        style={styles.plusImage}
        source={require('../../assets/plus-icon.png')}
        accessibilityHint="plus-image"
       />
      </View>
import { useLayoutEffect } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { HomeTabsProps } from '../../types/usenavigation.type';
import { useThemeColors } from '../../constants/colors';
import { getStyles } from './Home.styles';

export const Home = () => {
  const navigation = useNavigation<HomeTabsProps>();
  const colors = useThemeColors();
  const {t} = useTranslation('auth');
  const styles = getStyles(colors);
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
    <View style={styles.container}>
      <View>
        <Text style={styles.description}>
          {t('You have no chats. Start Messaging!')}
        </Text>
      </View>
      <TouchableOpacity style={styles.innerContainer} onPress={()=>navigation.navigate('contacts')}>
        <Image
          style={styles.plusImage}
          source={require('../../assets/plus-icon.png')}
          accessibilityHint="plus-image"
        />
      </TouchableOpacity>
    </View>
  );
};

