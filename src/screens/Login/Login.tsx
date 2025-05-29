import {useNavigation} from '@react-navigation/native';
import phone from 'phone';
import {useTranslation} from 'react-i18next';
import {
  Image,
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
import {Placeholder} from '../../components/InputField/InputField';
import {keyDecryption} from '../../services/KeyDecryption';
import {loginUser} from '../../services/LoginUser';
import {hide, show} from '../../store/slices/loadingSlice';
import {
  resetLoginForm,
  setLoginErrors,
  setLoginField,
  setLoginSuccess,
} from '../../store/slices/loginSlice';
import {RootState} from '../../store/store';
import {useThemeColors} from '../../themes/colors';
import {useImagesColors} from '../../themes/images';
import {HomeTabsProps, NavigationProps} from '../../types/usenavigation.type';
import {
  setAlertTitle,
  setAlertType,
  setAlertVisible,
  setAlertMessage,
} from '../../store/slices/registrationSlice';
import {CustomAlert} from '../../components/CustomAlert/CustomAlert';

import {loginStyles} from './Login.styles';
import { getDeviceId } from '../../services/GenerateDeviceId';

export function Login() {
  const homeNavigation = useNavigation<HomeTabsProps>();
  const navigate = useNavigation<NavigationProps>();
  const dispatch = useDispatch();
  const colors = useThemeColors();
  const {logo} = useImagesColors();
  const styles = loginStyles(colors);
  const {t} = useTranslation('auth');
  const {form, errors} = useSelector((state: RootState) => state.login);
  const {alertType, alertTitle, alertMessage} = useSelector(
    (state: RootState) => state.registration,
  );
  const showAlert = (type: string, title: string, message: string) => {
    dispatch(setAlertType(type));
    dispatch(setAlertTitle(title));
    dispatch(setAlertMessage(message));
    dispatch(setAlertVisible(true));
  };

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

  async function handleLogin() {
    dispatch(setLoginErrors({}));
    dispatch(show());

    if (!validateForm()) {
      dispatch(hide());
      return;
    }

    try {
      const deviceId = await getDeviceId();
       const result = await loginUser(form,deviceId);

      if (result.status === 200) {
        const user = result?.data?.user;
        const privateKey = await keyDecryption({
          encryptedPrivateKeyData: user.privateKey,
          password: form.password,
        });

        dispatch(hide());
        dispatch(setAlertVisible(true));
        showAlert('success', 'Login', 'Successfully login');

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


        dispatch(resetLoginForm());
      } else if (result.status === 404) {
        dispatch(hide());
        showAlert(
          'error',
          'Login failed',
          'No account exists with this phone number',
        );
      } else if (result.status === 401) {
        dispatch(hide());
        showAlert(
          'warning',
          'Login failed',
          'Incorrect phone number or password. Please try again.',
        );
      } 
      else if (result.status === 409) {
        dispatch(hide());
        showAlert(
          'warning',
          'Login failed',
          'Logged in from a new device using your number. Please check your account.',
        );
      }else {
        dispatch(hide());
        showAlert('error', 'Login failed', 'Something went wrong while login');
      }
    } catch (error: any) {
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
        contentContainerStyle={styles.loginMainContainer}
        keyboardShouldPersistTaps="handled">
        <Image
          style={styles.image}
          source={logo}
          accessibilityHint="logo-image"
        />
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
          onChange={(text: string) => {
            handleInputChange('password', text);
          }}
          secureTextEntry={true}
        />
        {errors.password && (
          <Text style={styles.error}>{t(`${errors.password}`)}</Text>
        )}
        <View style={styles.loginButtonContainer}>
          <Button title="Login" onPress={handleLogin} />
        </View>
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
    </KeyboardAvoidingView>

  );
}
