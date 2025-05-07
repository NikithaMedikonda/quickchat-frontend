import React, {useState} from 'react';
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

export const Registration = () => {
  const [userImage, setUserImage] = useState(require('../../assets/image.png'));
  const [imageUri, setImageUri] = useState('');
  const handleOpenGallery = async () => {
    const hasPermission = await requestPermissions();
    if (Platform.OS === 'android') {
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'We need access to your photos to select an image.',
        );
        return;
      }
    }
    if (Platform.OS === 'ios') {
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
    const source: string = pickedImage.path;
    setUserImage({uri: source});
    setImageUri(source);
  };

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    email: '',
  });
  const [formErrors, setFormErrors] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    email: '',
  });

  const colors = useThemeColors();
  const styles = getStyles(colors);

  const handleInputChange = (key: string, value: string) => {
    setForm(prev => ({...prev, [key]: value}));
  };

  const onPress = () => {
    setForm({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      email: '',
    });
    setFormErrors({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      email: '',
    });
    validateForm();
  };

  const inputFields = [
    {key: 'firstName', title: 'First Name'},
    {key: 'lastName', title: 'Last Name'},
    {key: 'phoneNumber', title: 'Phone Number'},
    {key: 'password', title: 'Password'},
    {key: 'confirmPassword', title: 'Confirm Password'},
    {key: 'email', title: 'Email (Optional)'},
  ];

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    const errors: typeof formErrors = {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      email: '',
    };

    if (!form.password) {
      errors.password = 'Password is required';
      isValid = false;
    }
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    if (!form.phoneNumber || form.phoneNumber.length !== 10) {
      errors.phoneNumber = 'Invalid phone number';
      isValid = false;
    }
    if (form.email && !validateEmail(form.email)) {
      errors.email = 'Invalid email format';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  return (
    <View style={styles.registrationMainContainer}>
      <TouchableOpacity onPress={handleOpenGallery}>
        <Image
          style={styles.logo}
          source={userImage}
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
          />
          {formErrors[field.key as keyof typeof formErrors] ? (
            <Text style={{color: 'red', fontSize: 12}}>
              {formErrors[field.key as keyof typeof formErrors]}
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
