import { TouchableOpacity, Text } from 'react-native'
import React from 'react'

type ButtonProps = {
    title: string;
    onPress?: () => void;
  };
  
const Button = ({title, onPress} : ButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  )
}

export default Button