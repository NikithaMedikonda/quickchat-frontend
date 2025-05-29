import {Dimensions, StyleSheet} from 'react-native';
import {Colors} from '../../themes/colors';

const {width, height} = Dimensions.get('window');

export const individualChatHeaderStyles = (colors: Colors) => {
  return StyleSheet.create({
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: height * 0.07,
      paddingRight: height * 0.02,
      paddingLeft: height * 0.02,
    },
    container: {
      flex: 1,
      justifyContent: 'space-evenly',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    backArrow: {
      width: width * 0.03,
      height: height * 0.03,
      resizeMode: 'contain',
    },
    profilePicture: {
      width: width * 0.11,
      height: width * 0.11,
      borderRadius: width * 0.055,
    },
    username: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
      fontWeight: '400',
      paddingLeft: width * 0.01,
      paddingRight: width * 0.01,
    },
    moreOptionsIcon: {
      width: width * 0.06,
      height: height * 0.035,
      resizeMode: 'contain',
      tintColor: colors.text,
    },
  });
};
