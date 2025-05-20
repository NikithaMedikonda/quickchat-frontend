import {StyleSheet, Dimensions} from 'react-native';
import {Colors} from '../../themes/colors.ts';

const {width, height} = Dimensions.get('window');

export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      height: height,
      width: width,
    },
    image: {
      width: width * 0.5,
      height: height * 0.3,
    },

    imageContainer: {
      height: height * 0.6,
      width: width * 0.9,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
