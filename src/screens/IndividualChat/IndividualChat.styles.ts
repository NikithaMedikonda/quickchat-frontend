import {StyleSheet, Platform, Dimensions} from 'react-native';
import {Colors} from '../../constants/colors';

const {width} = Dimensions.get('window');

export const individualChatstyles = (colors: Colors) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flexContainer: {
      flex: 1,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingTop: Platform.OS === 'ios' ? 50 : 40,
      paddingBottom: 10,
      backgroundColor: colors.background,
    },
    backIcon: {
      width: width * 0.06,
      height: width * 0.06,
      tintColor: colors.text,
      resizeMode: 'contain',
    },
    profileImage: {
      width: width * 0.12,
      height: width * 0.12,
      borderRadius: width * 0.06,
      marginHorizontal: 10,
    },
    usernameText: {
      flex: 1,
      color: colors.white,
      fontSize: 20,
      fontWeight: '600',
    },
    moreOptionsIcon: {
      width: width * 0.08,
      height: width * 0.08,
      resizeMode: 'contain',
    },
    chatContentContainer: {
      paddingHorizontal: 10,
      paddingBottom: 20,
    },
    messageInput: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: colors.background,
      marginBottom: 20,
    },
    sendIcon: {
      width: width * 0.15,
      height: width * 0.15,
      marginLeft: 0,
      resizeMode: 'contain',
    },
    receivedMessageContainer: {
      alignSelf: 'flex-start',
      backgroundColor: colors.white,
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
    sentMessageContainer: {
      alignSelf: 'flex-end',
      backgroundColor: colors.lightBlue,
      borderTopLeftRadius: 12,
      borderBottomRightRadius: 12,
      borderBottomLeftRadius: 12,
      padding: 10,
      marginVertical: 4,
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
