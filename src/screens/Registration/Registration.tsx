import React, {useState} from 'react';
import {
  Alert,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button} from '../../components/Button.tsx';
import {getStyles} from './Registration.ts';
import {Placeholder} from '../../components/InputField.tsx';
import {useThemeColors} from '../../constants/colors.ts';
import {requestPermissions} from '../../permissions/ImagePermissions.ts';
import ImageCropPicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';

export const Registration = () => {
  const [userImage, setUserImage] = useState(require('../../assets/image.png'));

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
    if (Platform.OS === 'ios' ) {
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
      height: 400,
      cropping: true,
    });
    const source: string = pickedImage.path;
      setUserImage(source)

  };

  const [form, setForm] = useState({
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
    console.log(form);
    setForm({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      email: '',
    });
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
        <Image style={styles.logo} source={userImage} resizeMode="contain"  testID = "logo"/>
      </TouchableOpacity>

      {inputFields.map(field => (
        <Placeholder
          key={field.key}
          title={field.title}
          value={form[field.key as keyof typeof form]}
          onChange={(text: string) => handleInputChange(field.key, text)}

        />
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
