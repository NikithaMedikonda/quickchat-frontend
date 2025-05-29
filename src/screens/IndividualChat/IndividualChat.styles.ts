import {Dimensions, StyleSheet} from 'react-native';
import {Colors} from '../../themes/colors';
const {width, height} = Dimensions.get('window');
export const individualChatStyles = (colors: Colors) => {
  return StyleSheet.create({
    container: {
      display: 'flex',
      backgroundColor: colors.background,
      height: height,
    },
    InputContainer: {
      justifyContent: 'flex-end',
      paddingBottom: 0.025 * width,
    },
    safeareaView: {
      flex: 1,
    },
    chatContainer: {
      paddingVertical: 18,
      paddingLeft: 0.028 * width,
      paddingRight: 0.028 * width,
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
      paddingTop: 5,
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.chatBackground,
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
    chatMainContainer: {
      flex: 1,
      gap: 10,
      borderColor: colors.receiveMessage,
      backgroundColor: colors.chatBackground,
      width: width * 1.00,
      borderRadius: width * 0.075,
    },
    chatInnerContainer: {
      width: width,
      height: height * 0.85,
    },
    ShowErrorContainer: {
      backgroundColor: '#FFFBEB',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    errorText: {
      color: '#2D3748',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 12,
      lineHeight: 22,
    },
  });
};
