import {StyleSheet, Dimensions} from 'react-native';
import {Colors} from '../../themes/colors';

const {width, height} = Dimensions.get('window');

export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      display: 'flex',
      height: height,
      width: width,
      backgroundColor: colors.background,
      alignItems: 'center',
      paddingTop: height * 0.1,
    },
    imageContainer: {
      height: height * 0.45,
      width: width * 0.85,
      paddingTop: height * 0.07,
    },
    gif: {
      height: height * 0.3,
      width: width * 0.6,
      alignSelf: 'center',
    },
    plusContainer: {
      height: height * 0.2,
      width: width * 0.85,
      display: 'flex',
      alignItems: 'flex-end',
      paddingTop: height * 0.12,
    },
    description: {
      color: colors.gray,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });
