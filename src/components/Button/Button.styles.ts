import {StyleSheet, Dimensions} from 'react-native';
import {Colors} from '../../themes/colors.ts';

const {width} = Dimensions.get('window');

export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    button: {
      paddingVertical: 12,
      height: 43,
      width: width * 0.4,
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
      fontSize: 15,
      fontWeight: '600',
      color: colors.buttonText,
    },
  });
