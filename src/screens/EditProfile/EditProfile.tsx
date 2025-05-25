import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  ALERT_TYPE,
  AlertNotificationRoot,
  Dialog,
} from 'react-native-alert-notification';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {RootState} from '../../store/store';
import {useThemeColors} from '../../themes/colors';
import {getStyles} from './EditProfile.styles';
import {Placeholder} from '../../components/InputField/InputField';
import {ImagePickerModal} from '../../components/ImagePickerModal/ImagePickerModal';
import {setIsVisible} from '../../store/slices/registrationSlice';
import { updateProfile } from '../../services/UpdateProfile';
import {ProfileScreenNavigationProp} from '../../types/usenavigation.type';
import { DEFAULT_PROFILE_IMAGE } from '../../constants/defaultImage';

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

  // const [ ,setImageURL] = useState('');
  const imageURLRef = useRef('');
  const [token, setToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [user, setUser] = useState<any>(null);


  const getUserData = async () => {
    try {
      const userDataString = await EncryptedStorage.getItem('user');
      const AccessToken = (await EncryptedStorage.getItem('authToken')) || '';
      const userData = userDataString ? JSON.parse(userDataString) : {};

      const {
        firstName = '',
        lastName = '',
        email = '',
        profilePhoto = '',
        phoneNumber : storedPhoneNumber = '',
      } = userData;

      setInputFirstName(firstName);
      setInputLastName(lastName);
      setInputEmail(email);
      imageURLRef.current = profilePhoto;
      // setImageURL(profilePhoto);
      setToken(AccessToken);
      setPhoneNumber(storedPhoneNumber);
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
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'First name is required',
        button: 'close',
        closeOnOverlayTap: true,
      });
      return false;
    }
    if (!inputLastName) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Last name is required',
        button: 'close',
        closeOnOverlayTap: true,
      });
      return false;
    }
    if (inputEmail && !validateEmail(inputEmail)) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Invalid email format',
        button: 'close',
        closeOnOverlayTap: true,
      });
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
          const result = await updateProfile(payload, user);
          if (result.status === 200) {
            await EncryptedStorage.setItem(
              'user',
              JSON.stringify(result.data.user),
            );
            Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Success',
            textBody: 'Profile updated successfully',
            button: 'close',
            closeOnOverlayTap: true,
          });
          setTimeout(() => {
            profileNavigation.replace('profileScreen');
          }, 4000);
          } else if (result.status === 400) {
          Dialog.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: 'Phone Number is required to change the profile image.',
            button: 'close',
            closeOnOverlayTap: true,
          });
          } else if (result.status === 404) {
            Dialog.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: 'No user exists with the given phone number.',
            button: 'close',
            closeOnOverlayTap: true,
          });
          }
        } catch (err) {
          Dialog.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: 'Failed to update profile',
            button: 'close',
            closeOnOverlayTap: true,
          });
        }
      } else {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: 'User data not loaded, Please try again.',
          button: 'close',
          closeOnOverlayTap: true,
        });
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
    <AlertNotificationRoot
      theme="dark"
      colors={[
        {
          label: '#000000',
          card: '#FFFFFF',
          overlay: '#FFFFFF',
          success: '#4CAF50',
          danger: '#F44336',
          warning: '#1877F2',
          info: '#000000',
        },
        {
          label: '#000000',
          card: '#FFFFFF',
          overlay: 'rgba(239, 238, 238, 0.5)',
          success: '#4CAF50',
          danger: '#F44336',
          warning: '#1877F2',
          info: '#000000',
        },
      ]}>
      <KeyboardAvoidingView style={styles.keyboardView}
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
                  user?.profilePicture || DEFAULT_PROFILE_IMAGE,
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
            <TouchableOpacity
              style={styles.touchableButton}
              onPress={handleSave}>
              <Text style={styles.buttonText}>{t('Save')}</Text>
            </TouchableOpacity>
          </View>

          <ImagePickerModal showDeleteOption />
        </ScrollView>
      </KeyboardAvoidingView>
    </AlertNotificationRoot>
  );
};
