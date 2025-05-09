import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-native';
import { Button } from '../../components/Button/Button';
import { ImagePickerModal } from '../../components/ImagePickerModal/ImagePickerModal';
import { Placeholder } from '../../components/InputField/InputField';
import { useThemeColors } from '../../constants/colors';
import { registerUser } from '../../services/RegisterUser';
import { show } from '../../store/slices/loadingSlice';
import { setLoginSuccess } from '../../store/slices/loginSlice';
import {
  resetForm,
  setErrors,
  setFormField,
  setIsVisible,
} from '../../store/slices/registrationSlice';
import { RootState } from '../../store/store';
import { getStyles } from './Registration.styles';

export const Registration = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {form, errors, imageUri, image, isVisible} = useSelector(
    (state: RootState) => state.registration,
  );
  const colors = useThemeColors();
  const styles = getStyles(colors);

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
    if (!form.phoneNumber || form.phoneNumber.length !== 10) {
      newErrors.phoneNumber = 'Invalid phone number';
      isValid = false;
    }
    if (form.email && !validateEmail(form.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }
    dispatch(setErrors(newErrors));
    return isValid;
  };

  const handleRegister = async () => {
    dispatch(setErrors({}));
    dispatch(show());
    if (!validateForm()) {
      return;
    }
    try {
      const result = await registerUser({...form, image});
      if (result.status === 409) {
        Alert.alert('User already exist with this number');
      } else if (result.status === 200) {
        dispatch(
          setLoginSuccess({
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
          })
        );
        await AsyncStorage.setItem('authToken', result.data.accessToken);
        await AsyncStorage.setItem('refreshToken', result.data.refreshToken);
        Alert.alert('Success', 'Form submitted successfully!');
        dispatch(resetForm());
      } else {
        Alert.alert('Something went wrong while registering');
      }
    } catch (e: any) {
      Alert.alert(e.message || 'Something went wrong');
    }
  };

  const inputFields = [
    {key: 'firstName', title: 'First Name'},
    {key: 'lastName', title: 'Last Name'},
    {key: 'phoneNumber', title: 'Phone Number'},
    {key: 'password', title: 'Password', secure: true},
    {key: 'confirmPassword', title: 'Confirm Password', secure: true},
    {key: 'email', title: 'Email (Optional)'},
  ] as const;

  return (
    <View style={styles.registrationMainContainer}>
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
            <Text style={{color: 'red', fontSize: 12}}>
              {errors[field.key]}
            </Text>
          )}
        </View>
      ))}
      <View style={styles.registerButtonContainer}>
        <Button title="Register" onPress={handleRegister} />
      </View>
      <View style={styles.loginButtonContainer}>
        <Text style={styles.loginButtontext}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigate('/login')}>
          <Text style={styles.loginButtonSignInText}>Sign in</Text>
        </TouchableOpacity>
      </View>
      {isVisible && <ImagePickerModal />}
    </View>
  );
};


// export const Registration  = Registrationn;
