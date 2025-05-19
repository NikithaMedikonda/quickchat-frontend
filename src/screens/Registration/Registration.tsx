import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useDispatch, useSelector} from 'react-redux';
import PhoneInput from 'react-native-phone-input';
import {Button} from '../../components/Button/Button';
import {getStyles} from './Registration.styles';
import {ImagePickerModal} from '../../components/ImagePickerModal/ImagePickerModal';
import {HomeTabsProps, NavigationProps} from '../../types/usenavigation.type';
import {Placeholder} from '../../components/InputField/InputField';
import {registerUser} from '../../services/RegisterUser';
import {
  resetForm,
  setErrors,
  setFormField,
  setIsVisible,
} from '../../store/slices/registrationSlice';
import {RootState} from '../../store/store';
import {hide, show} from '../../store/slices/loadingSlice';
import {setLoginSuccess} from '../../store/slices/loginSlice';
import {useNavigation} from '@react-navigation/native';
import {useThemeColors} from '../../constants/colors';
import {useTranslation} from 'react-i18next';

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
      newErrors.firstName = 'First name is required';
      isValid = false;
    }
    if (!form.lastName) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }
    if (!form.password || !validatePassword(form.password)) {
      newErrors.password = 'Invalid password';
      isValid = false;
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (form.email && !validateEmail(form.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }
    if (!form.phoneNumber) {
      newErrors.phoneNumber = 'Phone number required!';
      isValid = false;
    } else if (form.phoneNumber.length < 10) {
      newErrors.phoneNumber = 'Invalid phone number';
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
      const result = await registerUser({...form, image});
      if (result.status === 409) {
        dispatch(hide());
        Alert.alert(t('User already exists with this number or email'));
      } else if (result.status === 200) {
        dispatch(hide());
        dispatch(
          setLoginSuccess({
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
            user: result.data.user,
          }),
        );
        await AsyncStorage.setItem('authToken', result.data.accessToken);
        await AsyncStorage.setItem('refreshToken', result.data.refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(result.data.user));
        homeNavigation.replace('hometabs');
        dispatch(resetForm());
      } else {
        dispatch(hide());
        Alert.alert(t('Something went wrong while registering'));
      }
    } catch (e) {
      dispatch(hide());
      Alert.alert(t('Network error or something unexpected happened'));
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
      // eslint-disable-next-line react-native/no-inline-styles
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <ScrollView
        contentContainerStyle={styles.registrationMainContainer}
        keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={handleOpenImageSelector}>
          <Image
            style={styles.logo}
            source={
              imageUri ? {uri: imageUri} : require('../../assets/image.png')
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
              // eslint-disable-next-line react-native/no-inline-styles
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
          <TouchableOpacity onPress={() => navigation.navigate('login')}>
            <Text style={styles.loginButtonSignInText}>{t('Sign in')}</Text>
          </TouchableOpacity>
        </View>
        {isVisible && <ImagePickerModal />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
