import {Dimensions, StyleSheet} from 'react-native';
import {Colors} from '../../themes/colors';
const {width, height} = Dimensions.get('window');
export const individualChatstyles = (colors: Colors) => {
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
      flex: 1,
    },
    messageBlock: {
      padding: 10,
      marginVertical: 5,
      borderRadius: 8,
      maxWidth: '75%',
    },
    sentMessage: {
      backgroundColor: colors.sendMessage,
      alignSelf: 'flex-end',
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
    },
    infoContainer: {
      width: width,
      height: height,
      flex:1,
      justifyContent:'flex-start',
      alignItems:'center',
      paddingVertical:50,
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
  });
};
