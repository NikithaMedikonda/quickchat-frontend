import {StyleSheet} from 'react-native';
import {Colors} from '../../themes/colors';
export const Timestampstyle = (colors: Colors) =>
  StyleSheet.create({
    color: {
      color: colors.darkGray,
      fontSize: 12,
    },
    sentColor: {
      color: colors.messageTextBox,
      fontSize: 12,
    },
  });
