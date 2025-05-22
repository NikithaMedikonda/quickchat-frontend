import {Dimensions, StyleSheet} from 'react-native';
import {Colors} from '../../themes/colors';

const {width, height} = Dimensions.get('window');

export const messageInputStyles = (colors: Colors) => {
  return StyleSheet.create({
    messageInput: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: width * 0.03,
      paddingVertical: height * 0.02,
      backgroundColor: colors.background,
    },
    inputBox: {
      height: height * 0.05,
      width: width * 0.75,
      fontSize: 16,
      borderRadius: 20,
      paddingHorizontal: 16,
      color: colors.gray,
      backgroundColor: colors.messageTextBox,
      // alignSelf: 'flex-start',
      marginRight: 6,
      textAlign: 'left',
      textAlignVertical: 'bottom',
      paddingVertical: 0,
    },
    placeholder: {
      color: colors.gray,
    },
    sendIcon: {
      width: width * 0.16,
      height: height * 0.055,
      resizeMode: 'contain',
      alignSelf: 'flex-start',
    },
  });
};
