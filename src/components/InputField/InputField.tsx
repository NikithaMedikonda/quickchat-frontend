import React from 'react';
import {StyleSheet, Dimensions, TextInput} from 'react-native';
import {useThemeColors} from '../../constants/color.ts';
const {width, height} = Dimensions.get('window');

export const Placeholder = ({
  title,
  value,
  onChange,
  secureTextEntry 
}: {
  title: string;
  value: string;
  onChange: (text: string) => void;
  secureTextEntry: boolean;
}) => {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <TextInput
      style={styles.input}
      value={value}
      placeholder={title}
      onChangeText={onChange}
      placeholderTextColor={styles.placeholder.color}
      testID="inputField"
      secureTextEntry={secureTextEntry}
    />
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    input: {
      height: height * 0.055,
      fontSize: 20,
      borderRadius: 10,
      width: width * 0.8,
      padding: 10,
      color: colors.gray,
      margin: height * 0.012,
      backgroundColor: colors.white,
    },
    placeholder: {
      color: colors.gray,
    },
  });
