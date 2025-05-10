import {TextInput} from 'react-native';
import {getStyles} from './InputField.styles.ts';
import {useThemeColors} from '../../constants/colors.ts';

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
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <TextInput
      style={styles.input}
      value={value}
      placeholder={title}
      onChangeText={onChange}
      placeholderTextColor={styles.placeholder.color}
      secureTextEntry={secureTextEntry}
    />
  );
};
