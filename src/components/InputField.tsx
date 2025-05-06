import React from 'react';
import {StyleSheet, Dimensions, TextInput } from 'react-native';
import { useThemeColors } from '../constants/colors.ts';
const { width, height } = Dimensions.get('window');

export const Placeholder = ({ title }: { title: string}) => {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <TextInput
          style={styles.input}
          value={title}
          placeholder={title}
        />
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    input: {
    height: height*0.055,
    fontSize:20,
    borderRadius:10,
    width:width*0.9,
    padding: 10,
    color:colors.gray,
    margin:height*0.018,
    backgroundColor:colors.white
    },
  });