import {Dimensions, StyleSheet} from 'react-native';
import {Colors} from '../../constants/colors';

const {width, height} = Dimensions.get('window');

export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    logo: {
      height: height * 0.14,
      width: width * 0.3,
      marginBottom: height * 0.03,
      borderRadius:100,
    },
    registrationMainContainer: {
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      height: height,
      width: width,
    },
    loginButtonContainer: {
      marginTop: height * 0.015,
      display: 'flex',
      flexDirection: 'row',
    },
    loginButtontext: {
      color: colors.text,
    },
    loginButtonSignInText: {
      color: colors.primaryBlue,
    },
    registerButtonContainer: {
      marginTop: height * 0.03,
    },
    errorText: {
      color: 'red',
    },
    placeholder: {
      color: colors.gray,
    },
    phoneNumber:{
            height: height * 0.055,
      fontSize: 20,
      borderRadius: 10,
      width: width * 0.8,
      padding: 10,
      color: colors.gray,
      margin: height * 0.012,
      backgroundColor: colors.white,
    },
  });
