import { Dimensions, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
const {width, height} = Dimensions.get('window');

export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    input: {
      height: height * 0.044,
      fontSize: 14,
      borderRadius: 8,
      width: width * 0.75,
      paddingHorizontal: 10,
       paddingVertical: 1,
      color: 'black',
      marginVertical: height * 0.01,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.gray,
    },
    placeholder: {
      color: colors.gray,
    },
  });
