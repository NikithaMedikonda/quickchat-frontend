import {StyleSheet, Dimensions} from 'react-native';
import {Colors} from '../../constants/colors';

const {width} = Dimensions.get('window');

export const sentMessageStyles = (colors: Colors) => {
  return StyleSheet.create({
    sentMessageContainer: {
      alignSelf: 'flex-end',
      backgroundColor: colors.primaryBlue,
      borderTopLeftRadius: 12,
      borderBottomRightRadius: 12,
      borderBottomLeftRadius: 12,
      padding: 10,
      marginVertical: 4,
      marginRight: width * 0.02,
      maxWidth: width * 0.75,

    },
    sentMessageText: {
      color: colors.white,
      fontSize: 16,
    },
    tickIcon: {
      width: 16,
      height: 16,
      marginTop: 4,
      alignSelf: 'flex-end',
      tintColor: colors.white,
    },
  });
};
