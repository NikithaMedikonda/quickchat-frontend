import {Alert, Image, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {phone} from 'phone';
import PhoneInput from 'react-native-phone-input';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import {Button} from '../../components/Button/Button';
import {Placeholder} from '../../components/InputField/InputField';
import {RootState} from '../../store/store';
import {
  resetLoginForm,
  setLoginErrors,
  setLoginField,
  setLoginSuccess,
} from '../../store/slices/loginSlice';
import {hide, show} from '../../store/slices/loadingSlice';
import {loginUser} from '../../services/LoginUser';
import {HomeTabsProps, NavigationProps} from '../../types/usenavigation.type';
import {useThemeColors} from '../../constants/colors';
import {NavigationProps} from '../../types/usenavigation.type';
import {loginStyles} from './Login.styles';
function Login() {
  const homeNavigation = useNavigation<HomeTabsProps>();
  const navigate = useNavigation<NavigationProps>();
  const dispatch = useDispatch();
  const colors = useThemeColors();
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
    console.log('In login ');
    dispatch(setLoginErrors({}));
    dispatch(show());
    if (!validateForm()) {
      dispatch(hide());
      return;
    }
    try {
      const result = await loginUser({...form});
      if (result.status === 200) {
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
        dispatch(resetLoginForm());
        homeNavigation.replace('hometabs');
      } else {
        dispatch(hide());
        Alert.alert(t('Something went wrong while login'));
      }
    } catch (error: any) {
      dispatch(hide());
      Alert.alert(t('Something went wrong'));
    }
  }
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require('../../assets/quickchat.png')}
        accessibilityHint="logo-image"
      />
      <PhoneInput
        style={styles.phoneNumber}
        initialCountry={'in'}
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
      <Button title="Login" onPress={handleLogin} />
      <View style={styles.messageView}>
        <Text style={styles.messageText}>{t('Don\'t have an account?')}</Text>
        <TouchableOpacity
          style={styles.signUpContainer}
          onPress={() => {
            navigate.navigate('register');
          }}>
          <Text style={styles.validationText}>{t('Sign up')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Login;
