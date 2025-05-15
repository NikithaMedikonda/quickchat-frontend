import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../constants/colors.ts';

const { width, height } = Dimensions.get('window');

export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      height: height * 0.08,
      width: width,
      paddingHorizontal: width * 0.025,
      gap: width * 0.1,
    },
    userDetailsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      width: width * 0.6,
      paddingRight: 10,
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
