import { Text, View } from 'react-native';
import { badgeStyles } from './Badge.styles';
import { useThemeColors } from '../../themes/colors.ts';

export const Badge = ({
  messageCount,
  variant = 'corner',
}: {
  messageCount: number;
  variant?: 'corner' | 'center';
}) => {
  const colors = useThemeColors();
  const styles = badgeStyles(colors);

  if (messageCount <= 0) { return null; }

  const badgeStyle =
    variant === 'center' ? styles.centeredBackground : styles.background;

  return (
    <View style={badgeStyle}>
      <Text style={styles.text}>{messageCount}</Text>
    </View>
  );
};
