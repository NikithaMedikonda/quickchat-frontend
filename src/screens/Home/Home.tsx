import { Image, Text, View } from 'react-native';
import { getStyles } from './Home.styles';
import { useThemeColors } from '../../constants/colors';

export const Home = () => {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.description}>You have no chats. Start Messaging!</Text>
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

