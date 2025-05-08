import React from 'react';
import {TouchableOpacity, Text, StyleSheet, Dimensions} from 'react-native';
import {colors, useThemeColors} from '../../constants/color';
const {width} = Dimensions.get('window');

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
      <Text style={styles.text}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// eslint-disable-next-line @typescript-eslint/no-shadow
const getStyles = (colors: colors) =>
  StyleSheet.create({
    button: {
      paddingVertical: 12,
      height: 50,
      width: width * 0.55,
      display: 'flex',
      justifyContent: 'center',
      alignContent: 'center',
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      backgroundColor: colors.primaryBlue,
      marginVertical: 5,
    },
    text: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
  });
