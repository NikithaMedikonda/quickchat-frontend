import { StyleSheet } from 'react-native';
import { Colors } from '../../themes/colors';

export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      position: 'relative',
    },
    chatsContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    plusIcon: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      zIndex: 10,
    },
  });
