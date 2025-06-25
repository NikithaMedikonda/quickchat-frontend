import { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import { useThemeColors } from '../../themes/colors';
import { otpInputStyles } from './OtpInputModal.styles';
interface OtpInputModalProps {
  visible: boolean;
}
export const OtpInputModal = ({visible}: OtpInputModalProps) => {
  const colors = useThemeColors();
  const styles = otpInputStyles(colors);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const handleOTPChange = (val: string) => {
    setOtp(val);
    setButtonDisabled(val.length !== 4);
  };
  const validateOtp = () => {
    if (otp === '' || otp.length < 4) {
      setError('');
    }
    console.log('OTP validated:', otp);
  };
  const onFilled = async (val: string) => {
    setOtp(val);
    setButtonDisabled(false);
    setError('');
  };
  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={validateOtp}>
      <View style={styles.modalView}>
        <View style={styles.modalTextView}>
          <Text style={styles.header}>Verification code required</Text>
          <Text style={styles.otpHeader}>
            Please enter the OTP sent to email
          </Text>
          <Text style={styles.error} numberOfLines={2}>
            {error}
          </Text>
          <OtpInput
            numberOfDigits={4}
            autoFocus={false}
            blurOnFilled={true}
            type="numeric"
            secureTextEntry={false}
            focusStickBlinkingDuration={500}
            onTextChange={handleOTPChange}
            onFilled={onFilled}
            textInputProps={{
              accessibilityLabel: 'One-Time Password',
            }}
            textProps={{
              accessibilityRole: 'text',
              accessibilityLabel: 'OTP digit',
              allowFontScaling: false,
            }}
            theme={{
              containerStyle: styles.container,
              pinCodeContainerStyle: styles.pinCodeContainer,
              pinCodeTextStyle: styles.pinCodeText,
              focusStickStyle: styles.focusStick,
              focusedPinCodeContainerStyle: styles.activePinCodeContainer,
              placeholderTextStyle: styles.placeholderText,
              filledPinCodeContainerStyle: styles.filledPinCodeContainer,
              disabledPinCodeContainerStyle: styles.disabledPinCodeContainer,
            }}
          />
          <View style={styles.timerView}>
            <Text>00:00</Text>
            <Text style={styles.resendText}>Resend</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            style={[
              styles.validateOtp,
              buttonDisabled && styles.disabledButton,
            ]}
            onPress={validateOtp}
            disabled={buttonDisabled}
            accessibilityState={{disabled: buttonDisabled}}>
            <Text style={styles.validateOtptext}>Validate OTP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
