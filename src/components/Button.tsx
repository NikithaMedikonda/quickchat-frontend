import { TouchableOpacity, Text,  StyleSheet, Dimensions} from 'react-native'
import React from 'react'
import { useThemeColors } from '../constants/color';

const { width } = Dimensions.get('window');

type ButtonProps = {
    title: string;
    onPress: () => void;
  };
  
const Button = ({title, onPress} : ButtonProps) => {
    const colors = useThemeColors();
    const styles = getStyles(colors);
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  )
}

const getStyles = (colors: any) =>
    StyleSheet.create({
      button: {
        height: 40,
        width: width * 0.45,
        borderRadius: 4,
        justifyContent: 'center',
        top: 290,
        alignItems: 'center',
        backgroundColor: colors.primaryBlue,
        marginVertical: 5,
      },
      text: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.white,
      },
    })

    export default Button