import {StyleSheet, Dimensions, ViewStyle, TextStyle} from 'react-native';
import {Colors} from '../../themes/colors';

const {width, height} = Dimensions.get('window');

interface StyleType {
  disabledButton: ViewStyle;
  info: TextStyle;
  error: TextStyle;
  header: TextStyle;
  container: ViewStyle;
  pinCodeContainer: ViewStyle;
  pinCodeText: TextStyle;
  otpHeader: TextStyle;
  focusStick: ViewStyle;
  activePinCodeContainer: ViewStyle;
  placeholderText: TextStyle;
  filledPinCodeContainer: ViewStyle;
  disabledPinCodeContainer: ViewStyle;
  modalView: ViewStyle;
  onClose: ViewStyle;
  onCloseText: TextStyle;
  modalTextView: ViewStyle;
  resendText: TextStyle;
  timerView: ViewStyle;
  reSendOpacity: TextStyle;
}

export const otpInputStyles = (colors: Colors) =>
  StyleSheet.create<StyleType>({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: height * 0.02,
    },
    error: {
      color: 'red',
      fontSize: 14,
      marginTop: 6,
      textAlign: 'center',
    },
    pinCodeContainer: {
      borderColor: colors.darkGray,
      marginHorizontal: 6,
      height: height * 0.06,
      width: width * 0.12,
      borderRadius: 10,
      borderBottomWidth: 1.5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pinCodeText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    focusStick: {
      width: 2,
      height: 24,
      backgroundColor: 'black',
    },
    activePinCodeContainer: {
      borderColor: colors.primaryBlue,
    },
    placeholderText: {
      color: colors.gray,
    },
    filledPinCodeContainer: {
      borderColor: colors.primaryBlue,
    },
    disabledPinCodeContainer: {
      opacity: 0.5,
    },
    modalView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalTextView: {
      width: '80%',
      paddingVertical: 20,
      paddingHorizontal: 20,
      backgroundColor: 'white',
      borderRadius: 12,
      justifyContent: 'space-between',
      alignItems: 'center',
      elevation: 5,
    },
    otpHeader: {
      fontSize: 16,
      color: 'black',
      lineHeight: 22,
      textAlign: 'center',
      marginBottom: 8,
    },
    onClose: {
      marginTop: 20,
      paddingVertical: 12,
      paddingHorizontal: 12,
      backgroundColor: colors.primaryBlue,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    onCloseText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    disabledButton: {
      backgroundColor: colors.gray,
      opacity: 0.5,
    },
    timerView: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      width: '100%',
      paddingHorizontal: 20,
    },
    resendText: {
      color: colors.primaryBlue,
      fontWeight: '500',
    },
    header: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12,
      color:colors.primaryBlue
    },
    info: {
      color: colors.primaryBlue,
      fontSize: 14,
      marginTop: 6,
      textAlign: 'center',
    },
    reSendOpacity: {
      opacity: 0.5,
    },
  });
