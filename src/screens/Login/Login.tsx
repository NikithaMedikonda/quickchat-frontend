import {useNavigation} from '@react-navigation/native';
import phone from 'phone';
import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import PhoneInput from 'react-native-phone-input';
import {useDispatch, useSelector} from 'react-redux';
import {Button} from '../../components/Button/Button';
import {CustomAlert} from '../../components/CustomAlert/CustomAlert';
import {Placeholder} from '../../components/InputField/InputField';
import {OtpInputModal} from '../../components/OtpInput/OtpInputModal';
import {clearLocalStorage} from '../../database/services/clearStorage';
import {getDeviceId} from '../../services/GenerateDeviceId';
import {keyDecryption} from '../../services/KeyDecryption';
import {loginUser} from '../../services/LoginUser';
import {sendLoginOtp} from '../../services/SendOtp';
import {syncFromRemote} from '../../services/SyncFromRemote';
import {verifyUserDetails} from '../../services/UserLoginStatus';
import {hide, show} from '../../store/slices/loadingSlice';
import {
  resetLoginForm,
  setLoginErrors,
  setLoginField,
  setLoginSuccess,
} from '../../store/slices/loginSlice';
import {
  setAlertMessage,
  setAlertTitle,
  setAlertType,
  setAlertVisible,
} from '../../store/slices/registrationSlice';
import {RootState} from '../../store/store';
import {useThemeColors} from '../../themes/colors';
import {useImagesColors} from '../../themes/images';
import {HomeTabsProps, NavigationProps} from '../../types/usenavigation.type';
import {loginStyles} from './Login.styles';

export function Login() {
  const homeNavigation = useNavigation<HomeTabsProps>();
  const navigate = useNavigation<NavigationProps>();
  const scrollViewRef = useRef<ScrollView>(null);
  const dispatch = useDispatch();
  const colors = useThemeColors();
  const {logo} = useImagesColors();
  const styles = loginStyles(colors);
  const {t} = useTranslation('auth');
  const {form, errors} = useSelector((state: RootState) => state.login);
  const {alertType, alertTitle, alertMessage} = useSelector(
    (state: RootState) => state.registration,
  );
  const [otp, setOtp] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [userData, setUserData] = useState({name: '', email: ''});
  const [loading, setLoading] = useState(false);

  const showAlert = (type: string, title: string, message: string) => {
    dispatch(setAlertType(type));
    dispatch(setAlertTitle(title));
    dispatch(setAlertMessage(message));
    dispatch(setAlertVisible(true));
  };
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({animated: true});
      }, 100);
    });

    return () => {
      showSub.remove();
    };
  }, []);

  const handleInputChange = (key: keyof typeof form, value: string) => {
    dispatch(setLoginField({key, value}));
  };
  const validateForm = () => {
    const newErrors: Partial<typeof form> = {};
    let isValid = true;
    if (!form.phoneNumber) {
      newErrors.phoneNumber = 'Phone number required!';
      isValid = false;
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (form.phoneNumber && !phone(form.phoneNumber).isValid) {
      newErrors.phoneNumber = 'Invalid phone number!';
      isValid = false;
    }
    dispatch(setLoginErrors(newErrors));
    return isValid;
  };

  const resendOtpHandler = async () => {
    await sendLoginOtp(userData.name, userData.email);
  };

  async function checkLoginDetails() {
    if (!validateForm()) {
      dispatch(hide());
      return;
    }
    setLoading(true);
    try {
      const details = await verifyUserDetails(form.phoneNumber, form.password);
      if (details.status === 410) {
        dispatch(hide());
        dispatch(setAlertVisible(true));
        showAlert(
          'error',
          'Registration failed',
          'Sorry, this account is deleted',
        );
      } else if (details.status === 404) {
        dispatch(hide());
        showAlert(
          'error',
          'Login failed',
          'No account exists with this phone number',
        );
      } else if (details.status === 401) {
        dispatch(hide());
        showAlert(
          'warning',
          'Login failed',
          'Incorrect phone number or password. Please try again.',
        );
      }
      if (details.isLogin) {
        const otpResult = await sendLoginOtp(
          `${details.name}`,
          `${details.email}`,
        );
        if (otpResult) {
          setUserData({name: details.name, email: details.email});
          setShowOTPModal(true);
        }
      } else {
        handleLogin();
      }
    } catch (e) {
      dispatch(hide());
      showAlert(
        'info',
        'Login failed',
        'Something went wrong. Check your connection.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    dispatch(setLoginErrors({}));
    dispatch(show());
    if (!validateForm()) {
      dispatch(hide());
      return;
    }
    try {
      const deviceId = await getDeviceId();
      const result = await loginUser(form, deviceId);
      if (result.status === 200) {
        const user = result?.data?.user;
        const privateKey = await keyDecryption({
          encryptedPrivateKeyData: user.privateKey,
          password: form.password,
        });
        dispatch(hide());
        dispatch(setAlertVisible(true));
        showAlert('success', 'Login', 'Successfully Logged in');
        dispatch(
          setLoginSuccess({
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
            user,
          }),
        );
        setTimeout(() => {
          dispatch(setAlertVisible(false));
          homeNavigation.replace('hometabs');
        }, 1000);
        await EncryptedStorage.setItem('authToken', result.data.accessToken);
        await EncryptedStorage.setItem(
          'refreshToken',
          result.data.refreshToken,
        );
        await EncryptedStorage.setItem('user', JSON.stringify(user));
        await EncryptedStorage.setItem('privateKey', privateKey);
        await EncryptedStorage.setItem('hardRefresh', 'false');
        const lastLoggedInUser = await EncryptedStorage.getItem(
          'lastLoggedInUser',
        );
        if (lastLoggedInUser !== user.phoneNumber) {
          await EncryptedStorage.setItem('lastLoggedInUser', user.phoneNumber);
          await clearLocalStorage();
          await syncFromRemote(user.phoneNumber);
          await EncryptedStorage.setItem('firstSync', 'true');
        }
        dispatch(resetLoginForm());
      } else if (result.status === 409) {
        dispatch(hide());
        showAlert(
          'warning',
          'Login failed',
          'Logged in from a new device using your number. Please check your account.',
        );
      } else {
        dispatch(hide());
      }
    } catch (error) {
      dispatch(hide());
      showAlert(
        'info',
        'Login failed',
        'Something went wrong. Check your connection.',
      );
    }
  }
  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.loginMainContainer}
        keyboardShouldPersistTaps="handled">
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={logo}
            accessibilityHint="logo-image"
          />
        </View>
        <PhoneInput
          style={styles.phoneNumber}
          initialCountry={'in'}
          initialValue={form.phoneNumber}
          textProps={{
            placeholder: 'Phone number',
          }}
          onChangePhoneNumber={(text: string) => {
            handleInputChange('phoneNumber', text);
          }}
          onPressFlag={() => {}}
        />
        {errors.phoneNumber && (
          <Text style={styles.error}>{t(`${errors.phoneNumber}`)}</Text>
        )}
        <Placeholder
          title="Password"
          value={form.password}
          onFocus={() => {
            scrollViewRef.current?.scrollToEnd({animated: true});
          }}
          onChange={(text: string) => {
            handleInputChange('password', text);
          }}
          secureTextEntry={true}
        />
        {errors.password && (
          <Text style={styles.error}>{t(`${errors.password}`)}</Text>
        )}
        {loading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <Button title="Login" onPress={checkLoginDetails}/>
        )}
        <View style={styles.messageView}>
          <Text style={styles.messageText}>{t("Don't have an account?")}</Text>
          <TouchableOpacity
            style={styles.signUpContainer}
            onPress={() => {
              navigate.replace('register');
            }}>
            <Text style={styles.validationText}>{t(' Sign up')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <CustomAlert type={alertType} title={alertTitle} message={alertMessage} />
      <OtpInputModal
        visible={showOTPModal}
        setIsVisible={setShowOTPModal}
        otp={otp}
        setOtp={setOtp}
        email={userData.email}
        onSuccess={handleLogin}
        resendHandler={resendOtpHandler}
      />
    </KeyboardAvoidingView>
  );
}
