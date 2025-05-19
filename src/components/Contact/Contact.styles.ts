import { StyleSheet} from 'react-native';
import {Colors} from '../../themes/colors';

export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    contactContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      backgroundColor: colors.background,
      height: 60,
    },
    leftBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    image: {
      width: 35,
      height: 35,
      borderRadius: 18,
    },
    nameNumberContainer: {
      flexDirection: 'column',
    },
    text: {
      color: colors.text,
      fontWeight: 'bold',
    },
    inviteText: {
      color: colors.primaryBlue,
      fontWeight: '600',
    },
  });
