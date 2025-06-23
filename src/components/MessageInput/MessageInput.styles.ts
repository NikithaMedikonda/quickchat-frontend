import {Dimensions, StyleSheet} from 'react-native';
import {Colors} from '../../themes/colors';

const {width, height} = Dimensions.get('window');

export const messageInputStyles = (colors: Colors) => {
  const fontSize = 16;

  return StyleSheet.create({
    messageInput: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingLeft: 15,
    },
    inputBox: {
      minHeight: 40,
      maxHeight: 120,
      width: width * 0.65,
      fontSize: fontSize,
      borderRadius: 10,
      color: colors.inputText,
      backgroundColor: colors.messageTextBox,
      textAlign: 'left',
      textAlignVertical: 'top',
      paddingVertical: 8,
      paddingHorizontal: 16,
      margin: 0,
    },
    placeholder: {
      color: colors.gray,
    },
    sendIcon: {
      width: width * 0.16,
      height: height * 0.07,
      resizeMode: 'contain',
      alignSelf: 'flex-start',
    },
  });
};
