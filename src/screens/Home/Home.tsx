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
    </View>
  );
};

