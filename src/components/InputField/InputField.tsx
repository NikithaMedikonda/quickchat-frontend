import {TextInput} from 'react-native';
import {getStyles} from './InputField.styles.ts';
import {useThemeColors} from '../../constants/colors.ts';
import { useTranslation } from 'react-i18next';

export const Placeholder = ({
  title,
  value,
  onChange,
  secureTextEntry = false,
}: {
  title: string;
  value: string;
  onChange: (text: string) => void;
  secureTextEntry: boolean;
}) => {

  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { t } = useTranslation('auth');

  return (
    <TextInput
      style={styles.input}
      value={value}
      placeholder={t(`${title}`)}
      onChangeText={onChange}
      placeholderTextColor={styles.placeholder.color}
      secureTextEntry={secureTextEntry}
    />
  );
};
