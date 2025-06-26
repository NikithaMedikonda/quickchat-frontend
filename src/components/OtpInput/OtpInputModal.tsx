import {useEffect, useRef, useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import {OtpInput, OtpInputRef} from 'react-native-otp-entry';
import {useThemeColors} from '../../themes/colors';
import {otpInputStyles} from './OtpInputModal.styles';
import {API_URL} from '../../constants/api';
import {useNavigation} from '@react-navigation/native';
import {NavigationProps} from '../../types/usenavigation.type';
import {
  setAlertType,
  setAlertTitle,
  setAlertMessage,
  setAlertVisible,
  resetForm,
} from '../../store/slices/registrationSlice';
import {useDispatch} from 'react-redux';
import {resetLoginForm} from '../../store/slices/loginSlice';

interface OtpInputModalProps {
  visible: boolean;
  setIsVisible: (visisble: boolean) => void;
  otp: string;
  setOtp: (otp: string) => void;
  email: string;
  onSuccess: () => void;
  resendHandler: () => void;
}

export const OtpInputModal = ({
  visible,
  setIsVisible,
  otp,
  setOtp,
  email,
  onSuccess,
  resendHandler,
}: OtpInputModalProps) => {
  const colors = useThemeColors();
  const styles = otpInputStyles(colors);
  const [error, setError] = useState<string>('');
  const [info, setInfo] = useState<string>('');
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [resendCount, setResendCount] = useState<number>(0);
  const navigation = useNavigation<NavigationProps>();
  const otpRef = useRef<OtpInputRef>(null);
  const dispatch = useDispatch();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const showAlert = (type: string, title: string, message: string) => {
    dispatch(setAlertType(type));
    dispatch(setAlertTitle(title));
    dispatch(setAlertMessage(message));
    dispatch(setAlertVisible(true));
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (visible && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [visible, timeLeft]);

  const handleOTPChange = (val: string) => {
    setOtp(val);
    setButtonDisabled(val.length !== 4);
  };

  const resend = async () => {
    setOtp('');
    setError('');
    otpRef.current?.clear();
    await resendHandler();
    setInfo('OTP Resent. Check your email');
    setTimeLeft(120);
    setResendCount(prev => prev + 1);
  };

  const validateOtp = async () => {
    setIsValidating(true);
    setError('');
    setInfo('');
    try {
      const response = await fetch(`${API_URL}/api/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otp,
        }),
      });

      const result = await response.json();
      console.log('otp', result);
      if (response.ok && result.isverified) {
        setIsVisible(false);
        onSuccess();
      } else {
        if (response.status === 410) {
          setError('OTP expired. Please try once again');
        } else if (response.status === 401) {
          setError('Invalid OTP');
        } else {
          setError('Something went wrong. Please try again later.');
        }
        if (resendCount > 0) {
          setTimeout(() => {
            showAlert(
              'info',
              'Redirecting...',
              'Taking you to the registration screen to restart the process.',
            );

            setIsVisible(false);
            setTimeout(() => {
              dispatch(resetForm());
              dispatch(resetLoginForm());
              navigation.replace('register');
            }, 1500);
          }, 2000);
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setIsValidating(false);
    }
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
      <TouchableWithoutFeedback
        accessibilityHint="otpModal"
        onPress={() => setIsVisible(false)}>
        <View style={styles.modalView}>
          <View style={styles.modalTextView}>
            <Text style={styles.header}>Verification code required</Text>
            <Text style={styles.otpHeader}>
              Please enter the OTP sent to email
            </Text>
            {error && (
              <Text style={styles.error} numberOfLines={2}>
                {error}
              </Text>
            )}
            {info && (
              <Text style={styles.info} numberOfLines={2}>
                {info}
              </Text>
            )}
            <View testID="otp-input-wrapper">
              <OtpInput
                numberOfDigits={4}
                ref={otpRef}
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
                  accessibilityHint: 'OTP digit',
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
                  disabledPinCodeContainerStyle:
                    styles.disabledPinCodeContainer,
                }}
              />
            </View>
            <View style={styles.timerView}>
              <Text>{formatTime(timeLeft)}</Text>
              {timeLeft === 0 ? (
                <TouchableOpacity onPress={resend}>
                  <Text style={styles.resendText}>Resend</Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.resendText, styles.reSendOpacity]}>
                  Resend
                </Text>
              )}
            </View>
            <TouchableOpacity
              testID="validate-otp-btn"
              accessibilityHint="validate-otp"
              style={[styles.onClose, buttonDisabled && styles.disabledButton]}
              onPress={validateOtp}
              disabled={buttonDisabled}>
              {isValidating ? (
                <View style={styles.onCloseText}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              ) : (
                <Text style={styles.onCloseText}>Validate OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
