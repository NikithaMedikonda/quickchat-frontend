import {Dimensions, StyleSheet} from 'react-native';
import {colors} from '../../constants/color';
const {width, height} = Dimensions.get('window');
export const loginStyles = (colors: colors) =>
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
      color: colors.white,
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
    phoneNumber: {
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
