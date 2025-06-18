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
      height: width * 0.04,
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
    nameWithBadgeContainer: {
      alignSelf: 'flex-start',
      gap: 4,
      flex: 1,
      paddingTop: height * 0.01,
    },
    onlineIndicator: {
      color: colors.onlineStatus,
      fontSize: 15,
      fontWeight: '400',
    },
  });
};
