import {StyleSheet, Dimensions} from 'react-native';
import {Colors} from '../../themes/colors';

const {width} = Dimensions.get('window');

export const receivedMessageStyles = (colors: Colors) => {
  return StyleSheet.create({
    receivedMessageContainer: {
      alignSelf: 'flex-start',
      backgroundColor: colors.text,
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
      borderBottomLeftRadius: 12,
      padding: 10,
      marginVertical: 4,
      maxWidth: width * 0.75,
    },
    receivedMessageText: {
      color: colors.background,
      fontSize: 16,
    },
  });
};
