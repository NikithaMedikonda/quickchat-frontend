import {TouchableOpacity, Text} from 'react-native';
import { useTranslation } from 'react-i18next';
import {getStyles} from './Button.styles';
import {useThemeColors} from '../../themes/colors';


export const Button = ({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) => {

  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { t } = useTranslation(['auth','home', 'start']);
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{t(`${title}`)}</Text>
    </TouchableOpacity>
  );
};

