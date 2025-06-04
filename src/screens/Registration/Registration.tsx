import {useNavigation} from '@react-navigation/native';
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
import {ImagePickerModal} from '../../components/ImagePickerModal/ImagePickerModal';
import {Placeholder} from '../../components/InputField/InputField';
import {DEFAULT_PROFILE_IMAGE} from '../../constants/defaultImage';
import {keyGeneration} from '../../services/KeyGeneration';
import {registerUser} from '../../services/RegisterUser';
import {hide, show} from '../../store/slices/loadingSlice';
import {setLoginSuccess} from '../../store/slices/loginSlice';
import {
  resetForm,
  setAlertMessage,
  setAlertTitle,
  setAlertType,
  setAlertVisible,
  setErrors,
  setFormField,
  setIsVisible,
} from '../../store/slices/registrationSlice';
import {RootState} from '../../store/store';
import {useThemeColors} from '../../themes/colors';
import {HomeTabsProps, NavigationProps} from '../../types/usenavigation.type';
import {CustomAlert} from '../../components/CustomAlert/CustomAlert';
import {getStyles} from './Registration.styles';
import {getDeviceId} from '../../services/GenerateDeviceId';

export const Registration = () => {
  const {alertType, alertTitle, alertMessage} = useSelector(
    (state: RootState) => state.registration,
  );
  const navigation = useNavigation<NavigationProps>();
  const homeNavigation = useNavigation<HomeTabsProps>();
  const dispatch = useDispatch();
  const {form, errors, imageUri, image, isVisible} = useSelector(
    (state: RootState) => state.registration,
  );
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const {t} = useTranslation('auth');

  const showAlert = (type: string, title: string, message: string) => {
    dispatch(setAlertType(type));
    dispatch(setAlertTitle(title));
    dispatch(setAlertMessage(message));
    dispatch(setAlertVisible(true));
  };
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
      const deviceId = await getDeviceId();
      const keys = await keyGeneration();
      const result = await registerUser(
        {...form, image},
        {
          publicKey: keys.publicKey,
          privateKey: keys.privateKey,
        },
        {deviceId: deviceId},
      );
      if (result.status === 404) {
        dispatch(hide());
        dispatch(setAlertVisible(true));
        showAlert(
          'error',
          'Registration failed',
          'Sorry, this account is deleted',
        );
      } else if (result.status === 409) {
        dispatch(hide());
        dispatch(setAlertVisible(true));
        showAlert(
          'error',
          'Registration failed',
          'User already exists with this number or email',
        );
      } else if (result.status === 200) {
        dispatch(hide());
        showAlert('success', 'Success', 'Successfully registered');
        dispatch(setAlertVisible(true));
        dispatch(
          setLoginSuccess({
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
            user: result.data.user,
          }),
        );
        setTimeout(() => {
          dispatch(setAlertVisible(false));
        }, 2000);
        await EncryptedStorage.setItem('authToken', result.data.accessToken);
        await EncryptedStorage.setItem(
          'refreshToken',
          result.data.refreshToken,
        );
        await EncryptedStorage.setItem(
          'user',
          JSON.stringify(result.data.user),
        );
        await EncryptedStorage.setItem('privateKey', keys.privateKey);
        showAlert(
          'success',
          'Registration success',
          'Registration completed successfully',
        );
        homeNavigation.replace('hometabs');
        dispatch(resetForm());
      } else {
        dispatch(hide());
        showAlert(
          'error',
          'Registration failed',
          'Something went wrong while registering',
        );
      }
    } catch (error) {
      dispatch(hide());
      showAlert('info', 'Network error', 'Please check your internet');
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
    <KeyboardAvoidingView
      style={styles.keyboardView}
      testID="keyboard-avoiding-view"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <ScrollView
        contentContainerStyle={styles.registrationMainContainer}
        keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={handleOpenImageSelector}>
          <Image
            style={styles.logo}
            source={imageUri ? {uri: imageUri} : {uri: DEFAULT_PROFILE_IMAGE}}
            resizeMode="contain"
            accessibilityHint="logo"
            accessibilityLabel="imageLogo"
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
              <Text style={styles.errorText}>{t(`${errors[field.key]}`)}</Text>
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
          <TouchableOpacity onPress={() => navigation.replace('login')}>
            <Text style={styles.loginButtonSignInText}>{t('Sign in')}</Text>
          </TouchableOpacity>
        </View>
        {isVisible && <ImagePickerModal />}
      </ScrollView>
      <CustomAlert type={alertType} title={alertTitle} message={alertMessage} />
    </KeyboardAvoidingView>
  );
};
