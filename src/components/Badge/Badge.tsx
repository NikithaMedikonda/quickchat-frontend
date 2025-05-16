import { Text, View } from 'react-native';
import { Badgestyles } from './Badge.styles';
import { useThemeColors } from '../../constants/colors.ts';

export const Badge = ({
  messageCount,
  variant = 'corner',
}: {
  messageCount: number;
  variant?: 'corner' | 'center';
}) => {
  const colors = useThemeColors();
  const styles = Badgestyles(colors);

  if (messageCount <= 0) { return null; }

  const badgeStyle =
    variant === 'center' ? styles.centeredBackground : styles.background;

  return (
    <View style={badgeStyle}>
      <Text style={styles.text}>{messageCount}</Text>
    </View>
  );
};
