import {Dimensions, StyleSheet} from 'react-native';
const {width, height} = Dimensions.get('window');
import {colors} from '../../constants/colors';
// eslint-disable-next-line @typescript-eslint/no-shadow
export const getStyles = (colors: colors) =>
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
  });
