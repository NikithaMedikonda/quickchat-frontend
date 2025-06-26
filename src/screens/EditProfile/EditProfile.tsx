import {useNavigation} from '@react-navigation/native';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import {useDispatch, useSelector} from 'react-redux';
import {CustomAlert} from '../../components/CustomAlert/CustomAlert';
import {ImagePickerModal} from '../../components/ImagePickerModal/ImagePickerModal';
import {Placeholder} from '../../components/InputField/InputField';
import {DEFAULT_PROFILE_IMAGE} from '../../constants/defaultImage';
import {updateProfile} from '../../services/UpdateProfile';
import {useDeviceCheck} from '../../services/useDeviceCheck';
import {
  setAlertMessage,
  setAlertTitle,
  setAlertType,
  setAlertVisible,
  setEditProfileForm,
  setErrors,
  setImage,
  setIsVisible,
} from '../../store/slices/registrationSlice';
import {RootState} from '../../store/store';
import {useThemeColors} from '../../themes/colors';
import {useImagesColors} from '../../themes/images';
import {ProfileScreenNavigationProp} from '../../types/usenavigation.type';
import {getStyles} from './EditProfile.styles';

export const BackButton = () => {
  const colors = useThemeColors();
  useDeviceCheck();
  const {androidBackArrow, iOSBackArrow} = useImagesColors();
  const profileNavigation = useNavigation<ProfileScreenNavigationProp>();
  const styles = getStyles(colors);

  return (
    <TouchableOpacity
      onPress={() => profileNavigation.navigate('profileScreen')}>
      <Image
        source={Platform.OS === 'android' ? androidBackArrow : iOSBackArrow}
        accessibilityHint="back-arrow-image"
        style={styles.backArrow}
      />
    </TouchableOpacity>
  );
};

export const EditProfile = () => {
  const colors = useThemeColors();
  const profileNavigation = useNavigation<ProfileScreenNavigationProp>();
  const styles = getStyles(colors);
  const {t} = useTranslation(['auth']);
  const dispatch = useDispatch();
  const imageUri = useSelector(
    (state: RootState) => state.registration.imageUri,
  );

  const [initialValues, setInitialValues] = useState<
    typeof editProfileForm | null
  >(null);

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

  const [user, setUser] = useState<{
    phoneNumber: string;
    profilePicture: string;
    firstName: string;
    lastName: string;
    email: string;
    token: string;
  }>();

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

      const initialImage = userData.profilePicture || '';
      dispatch(setImage(initialImage));

      setUser(userData);
      dispatch(
        setEditProfileForm({key: 'firstName', value: userData.firstName || ''}),
      );
      dispatch(
        setEditProfileForm({key: 'lastName', value: userData.lastName || ''}),
      );
      dispatch(
        setEditProfileForm({key: 'email', value: userData.email || ''}),
      );
      dispatch(
        setEditProfileForm({
          key: 'phoneNumber',
          value: userData.phoneNumber || '',
        }),
      );
      dispatch(setEditProfileForm({key: 'token', value: AccessToken}));
      dispatch(setEditProfileForm({key: 'image', value: initialImage}));

      setInitialValues({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        token: AccessToken,
        image: initialImage,
      });
    } catch (error) {
      dispatch(setAlertVisible(true));
      showAlert('error', 'Error', 'Something went wrong');
    }
  }, [dispatch, showAlert]);

  const renderHeaderLeft = useCallback(() => <BackButton />, []);
  useEffect(() => {
    getUserData();
  }, [getUserData]);

  useLayoutEffect(() => {
    profileNavigation.setOptions({
      headerTitleAlign: 'center',
      headerTitle: 'Edit Profile',
      headerLeft: renderHeaderLeft,
    });
  }, [profileNavigation, renderHeaderLeft]);


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
            const updatedUser = result.data.user;
            await EncryptedStorage.setItem('user', JSON.stringify(updatedUser));
            setInitialValues({
              firstName: updatedUser.firstName || '',
              lastName: updatedUser.lastName || '',
              email: updatedUser.email || null,
              phoneNumber: updatedUser.phoneNumber || '',
              token: editProfileForm.token,
              image: updatedUser.profilePicture || '',
            });
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
      } else {
        dispatch(setAlertVisible(true));
        showAlert('error', 'Error', 'Something went wrong');
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
  ] as const;
  const renderedImage =
    imageUri || user?.profilePicture || DEFAULT_PROFILE_IMAGE;

  const isFormChanged = useMemo(() => {
    if (!initialValues) {
      return false;
    }
    const imageChanged = (initialValues.image || '') !== (editedImage || '');
    return (
      initialValues.firstName !== editProfileForm.firstName ||
      initialValues.lastName !== editProfileForm.lastName ||
      imageChanged
    );
  }, [initialValues, editProfileForm, editedImage]);

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
              uri: renderedImage,
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
          <TouchableOpacity
            accessibilityHint="Save-button"
            accessibilityState={{disabled: !isFormChanged}}
            style={[
              styles.touchableButton,
              !isFormChanged && styles.touchableButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!isFormChanged}>
            <Text style={styles.buttonText}>{t('Save')}</Text>
          </TouchableOpacity>
        </View>
        <ImagePickerModal showDeleteOption />
      </ScrollView>
      <CustomAlert type={alertType} title={alertTitle} message={alertMessage} />
    </KeyboardAvoidingView>
  );
};
