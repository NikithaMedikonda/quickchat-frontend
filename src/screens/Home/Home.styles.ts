import {StyleSheet, Dimensions} from 'react-native';
import {Colors} from '../../constants/colors';

const {width, height} = Dimensions.get('window');

export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      display: 'flex',
      height: height,
      width: width,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    description: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    gif: {
      height: height * 0.3,
      width: width * 0.6,
      marginBottom: height * 0.005,
    },
  });
