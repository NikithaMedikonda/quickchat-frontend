import { Dimensions, StyleSheet } from 'react-native';
import { Colors } from '../../themes/colors.ts';

const { width, height } = Dimensions.get('window');

export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      height: height * 0.08,
      width: width * 0.9,
      paddingLeft: width * 0.05,
      paddingRight: width * 0.05,
      gap: width * 0.03,
    },
    userDetailsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      width: width * 0.6,
      paddingRight: 7,
    },
    messageDetailsContainer: {
      display: 'flex',
      flexDirection: 'column',
      width: width * 0.25,
      height: height * 0.06,
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      gap: 2,
    },
    timeStampContainer: {
      display: 'flex',
      width: 'auto',
    },
    badgeContainer: {
      alignItems: 'flex-end',
      height: height * 0.025,
      width: width * 0.2,
    },
  });
