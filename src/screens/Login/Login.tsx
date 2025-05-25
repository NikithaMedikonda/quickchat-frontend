import {useNavigation} from '@react-navigation/native';
import phone from 'phone';
import React from 'react';
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
import {
  ALERT_TYPE,
  AlertNotificationRoot,
  Dialog,
} from 'react-native-alert-notification';
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
import {loginStyles} from './Login.styles';

export function Login() {
  const homeNavigation = useNavigation<HomeTabsProps>();
  const navigate = useNavigation<NavigationProps>();
  const dispatch = useDispatch();
  const colors = useThemeColors();
  const {logo} = useImagesColors();
  const styles = loginStyles(colors);
  const {t} = useTranslation('auth');
  const {form, errors} = useSelector((state: RootState) => state.login);

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
      const result = await loginUser({...form});
      const user = result?.data?.user;
      const privateKey = await keyDecryption({
        encryptedPrivateKeyData: user.privateKey,
        password: form.password,
      });
      if (result.status === 200) {
        dispatch(hide());
        dispatch(
          setLoginSuccess({
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
            user: result.data.user,
          }),
        );
        await EncryptedStorage.setItem('authToken', result.data.accessToken);
        await EncryptedStorage.setItem(
          'refreshToken',
          result.data.refreshToken,
        );
        await EncryptedStorage.setItem(
          'user',
          JSON.stringify(result.data.user),
        );
        await EncryptedStorage.setItem('privateKey', privateKey);
        dispatch(resetLoginForm());
        homeNavigation.replace('hometabs');
      } else if (result.status === 404) {
        dispatch(hide());
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Login failed',
          textBody: 'No account exists with this phone number',
          button: 'close',
          closeOnOverlayTap: true,
        });
      } else if (result.status === 401) {
        dispatch(hide());
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Login failed',
          textBody: 'Invalid credentials!',
          button: 'close',
          closeOnOverlayTap: true,
        });
      } else {
        dispatch(hide());
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Login failed',
          textBody: 'Something went wrong while login',
          button: 'close',
          closeOnOverlayTap: true,
        });
      }
    } catch (error: any) {
      dispatch(hide());
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Login failed',
        textBody: 'Something went wrong',
        button: 'close',
        closeOnOverlayTap: true,
      });
    }
  }
  return (
    <AlertNotificationRoot
      theme="dark"
      colors={[
        {
          label: '#000000',
          card: '#FFFFFF',
          overlay: 'rgba(0, 0, 0, 0.5)',
          success: '#4CAF50',
          danger: '#F44336',
          warning: '#1877F2',
          info: '#000000',
        },
        {
          label: '#000000',
          card: '#FFFFFF',
          overlay: 'rgb(255, 254, 254)',
          success: '#4CAF50',
          danger: '#F44336',
          warning: '#FFFFFF',
          info: '#000000',
        },
      ]}>
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
            <Text style={styles.messageText}>
              {t("Don't have an account?")}
            </Text>
            <TouchableOpacity
              style={styles.signUpContainer}
              onPress={() => {
                navigate.replace('register');
              }}>
              <Text style={styles.validationText}>{t('Sign up')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AlertNotificationRoot>
  );
}
