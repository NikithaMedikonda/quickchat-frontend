import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
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
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../components/Button/Button';
import { ImagePickerModal } from '../../components/ImagePickerModal/ImagePickerModal';
import { Placeholder } from '../../components/InputField/InputField';
import { DEFAULT_PROFILE_IMAGE } from '../../constants/defaultImage';
import { keyGeneration } from '../../services/KeyGeneration';
import { registerUser } from '../../services/RegisterUser';
import { hide, show } from '../../store/slices/loadingSlice';
import { setLoginSuccess } from '../../store/slices/loginSlice';
import {
  resetForm,
  setErrors,
  setFormField,
  setIsVisible,
} from '../../store/slices/registrationSlice';
import { RootState } from '../../store/store';
import { useThemeColors } from '../../themes/colors';
import { HomeTabsProps, NavigationProps } from '../../types/usenavigation.type';
import { getStyles } from './Registration.styles';

export const Registration = () => {
  const navigation = useNavigation<NavigationProps>();
  const homeNavigation = useNavigation<HomeTabsProps>();
  const dispatch = useDispatch();
  const {form, errors, imageUri, image, isVisible} = useSelector(
    (state: RootState) => state.registration,
  );
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const {t} = useTranslation('auth');

  const handleOpenImageSelector = async () => {
    dispatch(setIsVisible(true));
  };

  const handleInputChange = (key: keyof typeof form, value: string) => {
    dispatch(setFormField({key, value}));
  };

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password: string) =>
    /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password);

  const validateForm = () => {
    const newErrors: Partial<typeof form> = {};
    let isValid = true;
    if (!form.firstName) {
      newErrors.firstName = 'First name required!';
      isValid = false;
    }
    if (!form.lastName) {
      newErrors.lastName = 'Last name required!';
      isValid = false;
    }
    if (!form.password || !validatePassword(form.password)) {
      newErrors.password = 'Invalid password!';
      isValid = false;
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match!';
      isValid = false;
    }

    if (form.email && !validateEmail(form.email)) {
      newErrors.email = 'Invalid email format!';
      isValid = false;
    }
    if (!form.phoneNumber) {
      newErrors.phoneNumber = 'Phone number required!';
      isValid = false;
    } else if (form.phoneNumber.length < 10) {
      newErrors.phoneNumber = 'Invalid phone number!';
      isValid = false;
    }

    dispatch(setErrors(newErrors));
    return isValid;
  };

  const handleRegister = async () => {
    dispatch(setErrors({}));
    dispatch(show());

    if (!validateForm()) {
      dispatch(hide());
      return;
    }

try {
  const keys = await keyGeneration();
  const result = await registerUser({ ...form, image},{
    publicKey: keys.publicKey,
    privateKey: keys.privateKey,
  });
  if (result.status === 409) {
    dispatch(hide());
    Dialog.show({
      type: ALERT_TYPE.DANGER,
      title: 'Registration failed',
      textBody: 'User already exists with this number or email',
      button: 'close',
      closeOnOverlayTap: true,
    });
  } else if (result.status === 200) {
    dispatch(hide());
    dispatch(
      setLoginSuccess({
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        user: result.data.user,
      }),
    );
    await EncryptedStorage.setItem('authToken', result.data.accessToken);
    await EncryptedStorage.setItem('refreshToken', result.data.refreshToken);
    await EncryptedStorage.setItem('user', JSON.stringify(result.data.user));
    await EncryptedStorage.setItem('privateKey',keys.privateKey);
    homeNavigation.replace('hometabs');
    dispatch(resetForm());
  } else {
    dispatch(hide());
    Dialog.show({
      type: ALERT_TYPE.DANGER,
      title: 'Registration failed',
      textBody: 'Something went wrong while registering',
      button: 'close',
      closeOnOverlayTap: true,
    });
  }
} catch (error:any) {
  dispatch(hide());
  Dialog.show({
    type: ALERT_TYPE.DANGER,
    title: 'Registration failed',
    textBody: 'Network error or something unexpected happened',
    button: 'close',
    closeOnOverlayTap: true,
  });
}
  };

  const inputFields = [
    {key: 'firstName', title: 'First Name'},
    {key: 'lastName', title: 'Last Name'},
    {key: 'password', title: 'Password', secure: true},
    {key: 'confirmPassword', title: 'Confirm Password', secure: true},
    {key: 'email', title: 'Email (Optional)'},
  ] as const;

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
          overlay: 'rgba(255, 255, 255, 0.5)',
          success: '#4CAF50',
          danger: '#F44336',
          warning: '#FFFFFF',
          info: '#000000',
        },
      ]}>
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <ScrollView
        contentContainerStyle={styles.registrationMainContainer}
        keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={handleOpenImageSelector}>
          <Image
            style={styles.logo}
            source={
              imageUri ? {uri: imageUri} : {uri: DEFAULT_PROFILE_IMAGE}
            }
            resizeMode="contain"
            accessibilityHint="logo"
          />
        </TouchableOpacity>
        <View>
          <PhoneInput
            style={styles.phoneNumber}
            initialCountry={'in'}
            textProps={{
              placeholder: 'Phone number',
            }}
            onChangePhoneNumber={(text: string) => {
              dispatch(setFormField({key: 'phoneNumber', value: text}));
            }}
            onPressFlag={() => {}}
          />
          {errors.phoneNumber && (
            <Text style={styles.phoneErrorText}>
              {t(`${errors.phoneNumber}`)}
            </Text>
          )}
        </View>
        {inputFields.map(field => (
          <View key={field.key}>
            <Placeholder
              title={field.title}
              value={form[field.key]}
              onChange={(text: string) => handleInputChange(field.key, text)}
              secureTextEntry={
                field.key === 'password' || field.key === 'confirmPassword'
                }
              />
              {errors[field.key] && (
                <Text style={styles.errorText}>
                  {t(`${errors[field.key]}`)}
                </Text>
              )}
            </View>
          ))}
          <View style={styles.registerButtonContainer}>
            <Button title="Register" onPress={handleRegister} />
          </View>
          <View style={styles.loginButtonContainer}>
            <Text style={styles.loginButtontext}>
              {t('Already have an account?')}{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('login')}>
              <Text style={styles.loginButtonSignInText}>{t('Sign in')}</Text>
            </TouchableOpacity>
          </View>
          {isVisible && <ImagePickerModal />}
        </ScrollView>
      </KeyboardAvoidingView>
    </AlertNotificationRoot>
  );
};
