import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { useThemeColors } from '../constants/colors';

const { width } = Dimensions.get('window');

type ButtonProps = {
    title: string;
    onPress: () => void;
  };
export const Button = ({title, onPress} : ButtonProps) => {
    const colors = useThemeColors();
    const styles = getStyles(colors);
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const getStyles = (colors: any) =>
    StyleSheet.create({
      button: {
        height: 40,
        width: width * 0.45,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primaryBlue,
        marginVertical: 5,
      },
      text: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.white,
      },
    });
