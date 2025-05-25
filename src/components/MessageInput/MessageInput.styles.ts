import {Dimensions, Platform, StyleSheet} from 'react-native';
import {Colors} from '../../themes/colors';

const {width, height} = Dimensions.get('window');

export const messageInputStyles = (colors: Colors) => {
  const inputBoxHeight = height * 0.05;
  const fontSize = 16;
  const verticalPadding = (inputBoxHeight - fontSize) / 2;

  return StyleSheet.create({
    messageInput: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingLeft: 15,
    },
    inputBox: {
      height: inputBoxHeight,
      width: width * 0.65,
      fontSize: fontSize,
      borderRadius: 10,
      color: colors.inputText,
      backgroundColor: colors.messageTextBox,
      textAlign: 'left',
      textAlignVertical: Platform.OS === 'android' ? 'center' : 'top',
      paddingTop: Platform.OS === 'ios' ? verticalPadding : 0,
      paddingBottom: 0,
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
