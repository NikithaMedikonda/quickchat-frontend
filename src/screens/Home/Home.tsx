import { useLayoutEffect } from 'react';
import { Text, View } from 'react-native';
import { useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { HomeTabsProps } from '../../types/usenavigation.type';
import { useThemeColors } from '../../constants/colors';
import { getStyles } from './Home.styles';
import PlusIcon from '../../components/PlusIcon/PlusIcon';

export const Home = () => {
  const navigation = useNavigation<HomeTabsProps>();
  const colors = useThemeColors();
  const { t } = useTranslation('auth');
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
      <View>
        <PlusIcon />
      </View>
    </View>
  );
};

