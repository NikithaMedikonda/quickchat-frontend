import {Dimensions, StyleSheet} from 'react-native';
import {Colors} from '../../themes/colors';
const {width, height} = Dimensions.get('window');

export const loginStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      height: height,
      width: width,
    },
    image: {
      width: width * 0.5,
      height: height * 0.3,
    },
    imageContainer: {
      height: height * 0.6,
      width: width * 0.9,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    validationText: {
      color: colors.primaryBlue,
      alignSelf: 'flex-start',
    },
    validationView: {
      height: height * 0.055,
      width: width * 0.8,
    },
    messageText: {
      color: colors.text,
    },
    messageView: {
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
    },
    signUpContainer: {
      alignSelf: 'center',
    },
    signUpText: {
      marginLeft: width * 0.015,
    },
    phoneNumber: {
      height: height * 0.044,
      fontSize: 20,
      borderRadius: 10,
      width: width * 0.8,
      padding: 10,
      color: colors.gray,
      margin: height * 0.012,
      backgroundColor: colors.placeholder,
    },
    error: {
      color: 'red',
      fontSize: 15,
      width: width * 0.75,
      marginLeft: width * 0.01,
    },
    loginMainContainer: {
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      height: height,
      width: width,
    },
    keyboardAvoidView: {
      flex: 1,
    },
    loginButtonContainer: {
      marginTop: height * 0.02,
    },
  });
