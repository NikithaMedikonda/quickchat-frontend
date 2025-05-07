import React from 'react';
import {
  Alert,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button} from '../../components/Button/Button.tsx';
import {getStyles} from './styles.ts';
import {Placeholder} from '../../components/InputFiled/InputField.tsx';
import {useThemeColors} from '../../constants/colors.ts';
import {requestPermissions} from '../../permissions/ImagePermissions.ts';
import ImageCropPicker from 'react-native-image-crop-picker';
import {useDispatch, useSelector} from 'react-redux';
import {
  setFormField,
  setErrors,
  setImageUri,
} from '../../store/slices/registrationSlice.ts';
import {RootState} from '../../store/store.ts';
import { resetForm } from '../../store/slices/registrationSlice.ts';

export const Registration = () => {
  const dispatch = useDispatch();
  const {form, errors, imageUri} = useSelector(
    (state: RootState) => state.registration,
  );
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const handleOpenGallery = async () => {
    const hasPermission = await requestPermissions();

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      if (hasPermission) {
        Alert.alert(
          'Permission Denied',
          'We need access to your photos to select an image.',
        );
        return;
      }
    }

    const pickedImage = await ImageCropPicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
    });
    dispatch(setImageUri(pickedImage.path));
  };

  const handleInputChange = (key: string, value: string) => {
    dispatch(setFormField({key: key as any, value}));
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors: Partial<typeof form> = {};

    if (!form.firstName) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }
    if (!form.lastName) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
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

  const onPress = () => {
    dispatch(setErrors({}));
    if (validateForm()) {
      Alert.alert('Success', 'Form submitted successfully!');
      dispatch(resetForm());
    }
  };

  const inputFields = [
    {key: 'firstName', title: 'First Name'},
    {key: 'lastName', title: 'Last Name'},
    {key: 'phoneNumber', title: 'Phone Number'},
    {key: 'password', title: 'Password'},
    {key: 'confirmPassword', title: 'Confirm Password'},
    {key: 'email', title: 'Email (Optional)'},
  ];

  return (
    <View style={styles.registrationMainContainer}>
       <TouchableOpacity onPress={handleOpenGallery}>
        <Image
          style={styles.logo}
          source={
            imageUri
              ? {uri: imageUri}
              : require('../../assets/image.png')
          }
          resizeMode="contain"
          testID="logo"
        />
      </TouchableOpacity>

      {inputFields.map(field => (
        <View key={field.key}>
          <Placeholder
            title={field.title}
            value={form[field.key as keyof typeof form]}
            onChange={(text: string) => handleInputChange(field.key, text)}
            secureTextEntry={
              field.key === 'password' || field.key === 'confirmPassword'
            }
          />
          {errors[field.key as keyof typeof errors] ? (
            // eslint-disable-next-line react-native/no-inline-styles
            <Text style={{color: 'red', fontSize: 12}}>
              {errors[field.key as keyof typeof errors]}
            </Text>
          ) : null}
        </View>
      ))}

      <View style={styles.registerButtonContainer}>
        <Button title="Register" onPress={onPress} />
      </View>

      <View style={styles.loginButtonContainer}>
        <Text style={styles.loginButtontext}>Already have an account? </Text>
        <TouchableOpacity>
          <Text style={styles.loginButtonSignInText}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
