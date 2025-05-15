import { Text, View } from 'react-native';
import { Badgestyles } from './Badge.styles';
import { useThemeColors } from '../../constants/colors.ts';

export const Badge = ({messageCount}:{messageCount:number}) => {
  const colors = useThemeColors();
  const styles = Badgestyles(colors);
  return (
    messageCount > 0 && (
      <View style={styles.background}>
        <Text style={styles.text}>{messageCount}</Text>
      </View>
    )
  );
};
