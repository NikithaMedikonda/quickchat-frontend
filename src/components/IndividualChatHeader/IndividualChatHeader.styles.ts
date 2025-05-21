import {Dimensions, StyleSheet} from 'react-native';
import {Colors} from '../../themes/colors';

const {width, height} = Dimensions.get('window');

export const individualChatHeaderStyles = (colors: Colors) => {
  return StyleSheet.create({
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: height * 0.07,
    },
    backArrow: {
      width: width * 0.04,
      height: width * 0.05,
      tintColor: colors.text,
      resizeMode: 'contain',
    },
    profilePicture: {
      width: width * 0.11,
      height: width * 0.11,
      borderRadius: width * 0.055,
      marginLeft: 12,
      marginRight: 8,
    },
    username: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
      fontWeight: '400',
    },
    moreOptionsIcon: {
      width: width * 0.06,
      height: width * 0.06,
      resizeMode: 'contain',
      tintColor: colors.text,
    },
  });
};
