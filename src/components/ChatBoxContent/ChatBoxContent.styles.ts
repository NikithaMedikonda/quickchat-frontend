import {StyleSheet, Dimensions} from 'react-native';
import {Colors} from '../../themes/colors.ts';

const {width, height} = Dimensions.get('window');

export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      display: 'flex',
      height: height * 0.06,
      width: width * 0.75,
      backgroundColor: colors.background,
    },
    innerContent: {
      width: width * 0.01,
      height: width * 0.01,
    },
    profileImage: {
      width: 50,
      height: 50,
      borderRadius: 25.5,
    },
    details: {
      paddingLeft: width * 0.16,
      gap: 8,
    },
    name: {
      color: colors.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
    descriptionWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      width: width * 0.55,
      height: 18,
      overflow: 'hidden',
    },
    description: {
      color: colors.text,
      fontSize: 14,
      flexShrink: 1,
    },
  });
