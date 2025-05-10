import {getStyles} from './Button.styles';
import {TouchableOpacity, Text} from 'react-native';
import {useThemeColors} from '../../constants/colors';

export const Button = ({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

