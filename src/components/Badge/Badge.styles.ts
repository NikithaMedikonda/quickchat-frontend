import { StyleSheet } from 'react-native';
import { Colors } from '../../themes/colors';
export const badgeStyles = (colors: Colors) =>
  StyleSheet.create({
    background: {
      position: 'absolute',
      top: -6,
      right: -6,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 14,
      backgroundColor: colors.primaryBlue,
      minWidth: 22,
      height: 23,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    centeredBackground: {
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 14,
      backgroundColor: colors.primaryBlue,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: colors.text,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });
