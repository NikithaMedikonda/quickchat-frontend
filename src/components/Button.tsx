import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { useThemeColors } from '../constants/colors';
const { width, height } = Dimensions.get('window');

export const Button = ({ title }: { title: string}) => {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <TouchableOpacity  style={styles.button}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    button: {
      paddingVertical: 12,
      height:50,
      width:width*0.55,
      display:"flex",
      justifyContent:"center",
      alignContent:"center",
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

