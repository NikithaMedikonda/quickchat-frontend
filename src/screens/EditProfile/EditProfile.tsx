import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {RootState} from '../../store/store';
import {useThemeColors} from '../../themes/colors';
import {getStyles} from './EditProfile.styles';
import {Placeholder} from '../../components/InputField/InputField';
import {ImagePickerModal} from '../../components/ImagePickerModal/ImagePickerModal';
import {
  setIsVisible,
  setAlertVisible,
  setAlertType,
  setAlertTitle,
  setAlertMessage,
  setErrors,
  setEditProfileForm,
} from '../../store/slices/registrationSlice';
import {updateProfile} from '../../services/UpdateProfile';
import {ProfileScreenNavigationProp} from '../../types/usenavigation.type';
import {DEFAULT_PROFILE_IMAGE} from '../../constants/defaultImage';
import {CustomAlert} from '../../components/CustomAlert/CustomAlert';

export const EditProfile = () => {
  const colors = useThemeColors();
  const profileNavigation = useNavigation<ProfileScreenNavigationProp>();
  const styles = getStyles(colors);
  const {t} = useTranslation(['home', 'auth']);
  const dispatch = useDispatch();
  const imageUri = useSelector(
    (state: RootState) => state.registration.imageUri,
  );

  const {alertType, alertTitle, alertMessage, errors, editProfileForm} =
    useSelector((state: RootState) => state.registration);
  const editedImage = useSelector(
    (state: RootState) => state.registration.image,
  );

  const handleInputChange = (
    key: keyof typeof editProfileForm,
    value: string,
  ) => {
    dispatch(setEditProfileForm({key, value}));
  };
  const setToken = useRef('');

  const [user, setUser] = useState<any>(null);

  const showAlert = useCallback(
    (type: string, title: string, message: string) => {
      dispatch(setAlertType(type));
      dispatch(setAlertTitle(title));
      dispatch(setAlertMessage(message));
      dispatch(setAlertVisible(true));
    },
    [dispatch],
  );

  const getUserData = useCallback(async () => {
    try {
      const userDataString = await EncryptedStorage.getItem('user');
      const AccessToken = (await EncryptedStorage.getItem('authToken')) || '';
      const userData = userDataString ? JSON.parse(userDataString) : {};
      setToken.current = AccessToken;

      setUser(userData);
      dispatch(
        setEditProfileForm({key: 'firstName', value: userData.firstName || ''}),
      );
      dispatch(
        setEditProfileForm({key: 'lastName', value: userData.lastName || ''}),
      );
      dispatch(setEditProfileForm({key: 'email', value: userData.email || ''}));
      dispatch(
        setEditProfileForm({
          key: 'phoneNumber',
          value: userData.phoneNumber || '',
        }),
      );
      dispatch(setEditProfileForm({key: 'token', value: AccessToken}));
      dispatch(setEditProfileForm({key: 'image', value: editedImage}));
    } catch (error) {
      dispatch(setAlertVisible(true));
      showAlert('error', 'Error', 'Something went wrong');
    }
  }, [dispatch, editedImage, showAlert]);

  useEffect(() => {
    getUserData();
  }, [getUserData]);

  useLayoutEffect(() => {
    profileNavigation.setOptions({
      headerTitleAlign: 'center',
      headerTitle: 'Edit Profile',
    });
  },);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const newErrors: Partial<typeof editProfileForm> = {};
    let isValid = true;
    if (!editProfileForm.firstName) {
      newErrors.firstName = 'First name required!';
      isValid = false;
    }
    if (!editProfileForm.lastName) {
      newErrors.lastName = 'Last name required!';
      isValid = false;
    }
    if (!editProfileForm.email && !validateEmail(editProfileForm.email)) {
      newErrors.email = 'Invalid email format!';
      isValid = false;
    }
    dispatch(setErrors(newErrors));
    return isValid;
  };

  const handleSave = async () => {
    const payloadToUpdate = {
      ...editProfileForm,
      image: editedImage,
    };
    if (validateForm()) {
      if (user) {
        try {
          const result = await updateProfile(payloadToUpdate, user);
          if (result.status === 200) {
            dispatch(setAlertVisible(true));
            await EncryptedStorage.setItem(
              'user',
              JSON.stringify(result.data.user),
            );
            showAlert('success', 'Success', 'Profile updated successfully');
            setTimeout(() => {
              dispatch(setAlertVisible(false));
              profileNavigation.replace('profileScreen');
            }, 1000);
          } else if (result.status === 400) {
            dispatch(setAlertVisible(true));
            showAlert(
              'error',
              'Error',
              'Phone Number is required to change the profile image.',
            );
          } else if (result.status === 404) {
            dispatch(setAlertVisible(true));
            showAlert(
              'error',
              'Error',
              'No user exists with the given phone number.',
            );
          }
        } catch (error) {
          dispatch(setAlertVisible(true));
          showAlert('error', 'Error', 'Failed to update profile');
        }
      }
    }
  };
  const inputFields = [
    {
      key: 'firstName',
      title: 'First Name',
    },
    {
      key: 'lastName',
      title: 'Last Name',
    },
    {
      key: 'email',
      title: 'Email',
    },
  ] as const;

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          onPress={() => dispatch(setIsVisible(true))}
          accessibilityHint="edit-profile-button">
          <Image
            source={{
              uri: imageUri || user?.profilePicture || DEFAULT_PROFILE_IMAGE,
            }}
            accessibilityHint="Profile-Picture"
            style={styles.profileImage}
          />
        </TouchableOpacity>
        {inputFields.map(field => (
          <View key={field.key} style={styles.fieldContainer}>
            <View style={styles.fieldTextContainer}>
              <Text style={styles.label}>{t(field.title)}</Text>
            </View>

            <Placeholder
              title={field.title}
              value={editProfileForm[field.key]}
              onChange={(text: string) => handleInputChange(field.key, text)}
              secureTextEntry={false}
            />

            {errors[field.key] && (
              <Text style={styles.errorText}>{t(`${errors[field.key]}`)}</Text>
            )}
          </View>
        ))}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.touchableButton} onPress={handleSave}>
            <Text style={styles.buttonText}>{t('Save')}</Text>
          </TouchableOpacity>
        </View>
        <ImagePickerModal showDeleteOption />
      </ScrollView>
      <CustomAlert type={alertType} title={alertTitle} message={alertMessage} />
    </KeyboardAvoidingView>
  );
};
