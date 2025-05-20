import {Dimensions, Platform, StyleSheet} from 'react-native';
import {Colors} from '../../constants/colors';
const {width} = Dimensions.get('window');

export const individualChatHeaderStyles = (colors: Colors) => {
  return StyleSheet.create({
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingTop: Platform.OS === 'ios' ? 50 : 40,
      paddingBottom: 10,
      backgroundColor: colors.background,
      gap: 10,
    },
    backArrow: {
      width: width * 0.08,
      height: width * 0.08,
      tintColor: colors.text,
      resizeMode: 'contain',
      alignSelf: 'flex-start',
      marginTop: width * 0.01,
    },
    profilePicture: {
      width: width * 0.13,
      height: width * 0.13,
      borderRadius: width * 0.06,
      marginHorizontal: 10,
    },
    username: {
      flex: 1,
      color: colors.text,
      fontSize: 25,
      fontWeight: '600',
    },
    moreOptionsIcon: {
      width: width * 0.08,
      height: width * 0.08,
      resizeMode: 'contain',
    },
  });
};
