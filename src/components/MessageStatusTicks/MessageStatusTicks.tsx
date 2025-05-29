import { StyleSheet, Text } from 'react-native';
import { useThemeColors } from '../../themes/colors';
interface Props {
  status: 'sent' | 'delivered' | 'read' | string;
}

export const MessageStatusTicks = ({status}: Props) => {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  switch (status) {
    case 'sent':
      return <Text style={styles.tick}>✓</Text>;
    case 'delivered':
      return <Text style={styles.tick}>✓✓</Text>;
    case 'read':
      return <Text style={[styles.tick, styles.readTick]}>✓✓</Text>;
    default:
      return null;
  }
};

const getStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    tick: {
      fontSize: 12,
      color: '#A9A9A9',
      marginLeft: 4,
    },
    readTick: {
      color: '#FFFFFF',
    },
    header:{
      color: colors.background,
    },
  });
