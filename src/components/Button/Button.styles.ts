import {StyleSheet, Dimensions} from 'react-native';
import {Colors} from '../../constants/colors.ts';

const {width} = Dimensions.get('window');

// eslint-disable-next-line @typescript-eslint/no-shadow
export const getStyles = (colors: Colors) =>
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
