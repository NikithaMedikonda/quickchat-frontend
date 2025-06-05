import { StyleSheet } from 'react-native';
import { Colors } from '../../themes/colors';
export const badgeStyles = (colors: Colors) =>
  StyleSheet.create({
    background: {
      position: 'absolute',
      top: -4,
      right: -4,
      paddingHorizontal: 6,
      paddingVertical: 0.5,
      borderRadius: 14,
      backgroundColor: colors.primaryBlue,
      minWidth: 21,
      height: 21,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    centeredBackground: {
      paddingVertical: 2,
      borderRadius: 14,
      backgroundColor: colors.primaryBlue,
      minWidth: 22,
      height: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: colors.text,
      fontWeight: 'bold',
      textAlign: 'center',
      top: 0.7,
    },
  });
