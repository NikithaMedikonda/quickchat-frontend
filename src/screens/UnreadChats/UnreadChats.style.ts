import { Dimensions, StyleSheet } from 'react-native';
import { Colors } from '../../themes/colors';

const { height } = Dimensions.get('window');
export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      position: 'relative',
      paddingTop: 4,
    },
    chatsContainer: {
      paddingTop: 20,
      backgroundColor: colors.background,
    },
    unreadtext: {
      color: colors.gray,
      fontSize: 18,
      fontWeight: 'bold',
    },
    noMessagesContainer: {
      marginTop: height * 0.35,
      alignItems: 'center',
    },
  });
