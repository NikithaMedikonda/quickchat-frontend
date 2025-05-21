import {StyleSheet} from 'react-native';
import {Colors} from '../../themes/colors';

export const individualChatstyles = (colors: Colors) => {
  return StyleSheet.create({
    container: {
      display: 'flex',
      flex: 1,
      backgroundColor: colors.background,
    },
    InputContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      marginBottom: 17,
    },
    chatContainer: {
      flex: 1,
      marginBottom: 10,
    },
    messageBlock: {
      padding: 10,
      marginVertical: 5,
      borderRadius: 8,
      maxWidth: '75%',
    },
    sentMessage: {
      backgroundColor: '#DCF8C6',
      alignSelf: 'flex-end',
    },
    receivedMessage: {
      backgroundColor: '#E1E1E1',
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
  });
};
