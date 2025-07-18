import { Dimensions, StyleSheet } from 'react-native';
import { Colors } from '../../themes/colors';

const {width, height} = Dimensions.get('window');

export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    contactsContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContactsDisplay: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    loadingContactsText: {
      color: colors.text,
      paddingHorizontal: 0.04 * width,
    },
    title: {
      color: colors.text,
      left: 0.04 * width,
      fontWeight: 'bold',
      paddingTop: 0.03 * height,
      paddingBottom: 0.01 * height,
      fontSize: 18,
    },
    contactDetailsContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      gap: 0.003 * height,
      paddingHorizontal: 0.02 * height,
    },
    scroll: {
      flexGrow: 1,
    },
    activityContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    refreshImage: {
      height: 15,
      width: 15,
    },
    backArrow: {
      width: width * 0.03,
      height: width * 0.04,
      resizeMode: 'contain',
    },
    noContactsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 60,
      gap: 12,
    },
    noContactsText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
      opacity: 0.8,
      lineHeight: 22,
    },
    noContactsEmoji: {
      fontSize: 48,
      marginBottom: 8,
    },
  });
