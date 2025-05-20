import { Dimensions, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

const {width, height} = Dimensions.get('window');

export const messageInputStyles = (colors: Colors) => {
  return StyleSheet.create({
    messageInput: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: colors.background,
      marginBottom: 15,
    },
    inputbox: {
      height: height * 0.055,
      fontSize: 20,
      borderRadius: 12,
      width: width * 0.7,
      padding: 4,
      color: colors.gray,
      margin: height * 0.01,
      backgroundColor: colors.white,
      alignSelf: 'flex-end',
    },
    placeholder: {
      color: colors.gray,
    },
    sendIcon: {
      width: width * 0.16,
      height: width * 0.16,
      resizeMode: 'contain',
    },
  });
};
