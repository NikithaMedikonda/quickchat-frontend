import {Dimensions, StyleSheet} from 'react-native';
const {width, height} = Dimensions.get('window');
export const getStyles = (colors: any) =>
  StyleSheet.create({
    logo: {
      height: height * 0.14,
      width: width * 0.33,
      marginBottom: height * 0.03,
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
    placeholder:{
      color:colors.gray,
    },
  });
