import React, {useEffect, useLayoutEffect, useState} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {RootState} from '../../store/store';
import {useDispatch} from 'react-redux';
import {useThemeColors} from '../../themes/colors';
import {getStyles} from './EditProfile.styles';
import {Placeholder} from '../../components/InputField/InputField';
import {ImagePickerModal} from '../../components/ImagePickerModal/ImagePickerModal';
import {setIsVisible} from '../../store/slices/registrationSlice';
import {editProfile} from '../../services/editProfile';
import {ProfileScreenNavigationProp} from '../../types/usenavigation.type';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const EditProfile = () => {
  const colors = useThemeColors();
  const profileNavigation = useNavigation<ProfileScreenNavigationProp>();
  const styles = getStyles(colors);
  const {t} = useTranslation(['home', 'auth']);
  const dispatch = useDispatch();
  const imageUri = useSelector(
    (state: RootState) => state.registration.imageUri,
  );
  const image = useSelector((state: RootState) => state.registration.image);

  const [inputFirstName, setInputFirstName] = useState('');
  const [inputLastName, setInputLastName] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [imageURL, setImageURL] = useState('');
  const [token, setToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [user, setUser] = useState<any>(null);

  const getUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('user');
      const AccessToken = (await AsyncStorage.getItem('authToken')) || '';
      const userData = userDataString ? JSON.parse(userDataString) : {};

      const {
        firstName = '',
        lastName = '',
        email = '',
        profilePhoto = '',
        // eslint-disable-next-line @typescript-eslint/no-shadow
        phoneNumber = '',
      } = userData;

      setInputFirstName(firstName);
      setInputLastName(lastName);
      setInputEmail(email);
      setImageURL(profilePhoto);
      setToken(AccessToken);
      setPhoneNumber(phoneNumber);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    getUserData();
  }, []);
  useLayoutEffect(() => {
    profileNavigation.setOptions({
      headerTitleAlign: 'center',
      headerTitle: 'Edit Profile',
    });
  }, [profileNavigation]);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    if (!inputFirstName) {
      Alert.alert('Error', 'First name is required');
      return false;
    }
    if (!inputLastName) {
      Alert.alert('Error', 'Last name is required');
      return false;
    }
    if (inputEmail && !validateEmail(inputEmail)) {
      Alert.alert('Error', 'Invalid email format');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (validateForm()) {
      const payload = {
        phoneNumber: phoneNumber,
        image: image,
        firstName: inputFirstName,
        lastName: inputLastName,
        email: inputEmail,
        token: token,
      };

      if (user) {
        try {
          const result = await editProfile(payload, user);
          await AsyncStorage.setItem('user', JSON.stringify(result.data.user));
          profileNavigation.replace('profileScreen');
          Alert.alert('Success', 'Profile updated successfully!');
        } catch (err) {
          Alert.alert('Error', 'Failed to update profile');
        }
      } else {
        Alert.alert('Error', 'User data not loaded. Please try again.');
      }
    }
  };

  const inputFields = [
    {
      key: 'firstName',
      label: 'First Name',
      value: inputFirstName,
      setter: setInputFirstName,
    },
    {
      key: 'lastName',
      label: 'Last Name',
      value: inputLastName,
      setter: setInputLastName,
    },
    {
      key: 'email',
      label: 'Email',
      value: inputEmail,
      setter: setInputEmail,
    },
  ];

  return (
    <KeyboardAvoidingView
      // eslint-disable-next-line react-native/no-inline-styles
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          onPress={() => dispatch(setIsVisible(true))}
          accessibilityHint="edit-profile-button">
          <Image
            source={{
              uri:
                imageUri ||
                user?.profilePicture ||
                'https://sdjetntpocezxjoelxgb.supabase.co/storage/v1/object/public/quick-chat/images/profile-pics/image.png',
            }}
            accessibilityHint="Profile-Picture"
            style={styles.profileImage}
          />
        </TouchableOpacity>
        {inputFields.map(field => (
          <View key={field.key} style={styles.fieldContainer}>
            <View style={styles.fieldTextContainer}>
              <Text style={styles.label}>{t(field.label)}</Text>
            </View>

            <Placeholder
              title={field.label}
              value={field.value}
              onChange={text => field.setter(text)}
              secureTextEntry={false}
            />
          </View>
        ))}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.touchableButton} onPress={handleSave}>
            <Text style={styles.buttonText}>{t('Save')}</Text>
          </TouchableOpacity>
        </View>

        <ImagePickerModal showDeleteOption />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
