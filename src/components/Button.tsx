import { TouchableOpacity, Text,  StyleSheet, Dimensions} from 'react-native'
import React from 'react'

type ButtonProps = {
    title: string;
    onPress?: () => void;
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

export default Button

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
    })