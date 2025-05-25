import {Dimensions, StyleSheet} from 'react-native';
import {Colors} from '../../themes/colors';
const {width, height} = Dimensions.get('window');
export const individualChatStyles = (colors: Colors) => {
  return StyleSheet.create({
    container: {
      display: 'flex',
      flex: 1,
      backgroundColor: colors.background,
    },
    InputContainer: {
      justifyContent: 'flex-end',
      marginBottom: 17,
    },
    chatContainer: {
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    messageBlock: {
      padding: 10,
      marginVertical: 5,
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
      borderTopRightRadius: 10,
      maxWidth: '75%',
    },
    receiveMessageBlock: {
      padding: 10,
      marginVertical: 5,
      borderBottomLeftRadius: 10,
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
      maxWidth: '75%',
    },
    sentMessageBlock: {
      padding: 10,
      marginVertical: 5,
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
      borderTopRightRadius: 10,
      maxWidth: '75%',
    },
    sentMessage: {
      backgroundColor: colors.sendMessage,
      alignSelf: 'flex-end',
      padding: 10,
    },
    receivedMessage: {
      backgroundColor: colors.receiveMessage,
      color: colors.background,
      alignSelf: 'flex-start',
    },
    messageText: {
      fontSize: 16,
    },
    timestamp: {
      fontSize: 12,
      color: 'gray',
      marginTop: 5,
      textAlign: 'right',
    },
    infoMessage: {
      color: 'white',
      fontSize: 12,
      paddingBottom: 10,
      alignSelf: 'center',
    },
    infoContainer: {
      width: width,
      height: height,
      flex: 1,
      alignItems: 'center',
      paddingRight: width * 0.2,
      paddingTop: height * 0.65,
    },
    sentMessageText: {
      color: colors.text,
    },
    receiveMessageText: {
      color: colors.background,
    },
    timestampContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    chatHeaderContainer: {
      flex: 0.14,
    },
    chatMainContainer: {
      flex: 0.86,
      paddingBottom: 50,
      paddingHorizontal: 20,
      borderColor: colors.receiveMessage,
    },
    chatInnerContainer: {
      backgroundColor: colors.chatBackground,
      flex: 1,
      borderRadius: 15,
    },
  });
};
