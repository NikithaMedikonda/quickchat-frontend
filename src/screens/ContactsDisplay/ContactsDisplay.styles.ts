import {Dimensions, StyleSheet,} from 'react-native';
import {Colors} from '../../themes/colors';

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
      left: 0.05 * width,
      fontWeight: 'bold',
      paddingTop: 0.02 * height,
      paddingBottom: 0.02 * height,
      fontSize: 18,
      paddingLeft: 0.02 * width,
      paddingRight: 0.02 * width,
    },
    contactDetailsContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      paddingLeft: 0.04 * width,
      paddingRight: 0.04 * width,
      gap: 0.02 * height,
    },
    scroll: {
      flexGrow: 1,
    },
  });
