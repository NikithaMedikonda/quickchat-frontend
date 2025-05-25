import {useEffect, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {ConfirmModal} from '../GenericConfirmModal/ConfirmModal';
import {hide, show} from '../../store/slices/loadingSlice';
import {logout} from '../../store/slices/loginSlice';
import {
  resetForm,
  setAlertTitle,
  setAlertType,
  setAlertMessage,
  setAlertVisible,
} from '../../store/slices/registrationSlice';
import {deleteUser} from '../../services/DeleteUser';
import {
  InitialStackProps,
  NavigationProps,
  ProfileScreenNavigationProp,
} from '../../types/usenavigation.type';
import {User} from '../../screens/Profile/Profile';
import {useThemeColors} from '../../themes/colors';
import {useImagesColors} from '../../themes/images';
import {getStyles} from './ProfileMoreOptionsModal.styles';
import {CustomAlert} from '../CustomAlert/CustomAlert';
import {RootState} from '../../store/store';

export const ProfileMoreOptionsModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const {bin, pencil, logoutImage} = useImagesColors();
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [buttonTypes, setButtonTypes] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [authToken, setAuthToken] = useState('');
  const navigation: NavigationProps = useNavigation();
  const profileNavigation: ProfileScreenNavigationProp = useNavigation();
  const initialStackNavigation: InitialStackProps = useNavigation();
  const {t} = useTranslation('profile');
  const {alertType, alertTitle, alertMessage} = useSelector(
    (state: RootState) => state.registration,
  );

  useEffect(() => {
    const getUserPhoneNumber = async () => {
      if (phoneNumber === '') {
        const userDataString = await EncryptedStorage.getItem('user');
        const token = await EncryptedStorage.getItem('authToken');
        if (userDataString) {
          const userDataParsed: User = JSON.parse(userDataString);
          setPhoneNumber(userDataParsed.phoneNumber);
        }
        if (token) {
          setAuthToken(token);
        }
      }
    };
    getUserPhoneNumber();
  }, [phoneNumber]);

  const showAlert = (type: string, title: string, message: string) => {
    dispatch(setAlertType(type));
    dispatch(setAlertTitle(title));
    dispatch(setAlertMessage(message));
    dispatch(setAlertVisible(true));
  };
  const handleDeleteAccountConfirmation = () => {
    onClose();
    setModalVisible(true);
    setButtonTypes('Delete');
    setMessage(t('Are you sure want to delete this account?'));
  };
  const handleLogoutConfirmation = () => {
    onClose();
    setModalVisible(true);
    setButtonTypes('Logout');
    setMessage(t('Are you sure want to logout from this device?'));
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const onConfirmLogout = async () => {
    handleModalClose();
    dispatch(logout());
    dispatch(setAlertVisible(true));
    showAlert('success', 'Login out', 'Successfully logout');
    await EncryptedStorage.clear();
    setTimeout(() => {
      dispatch(setAlertVisible(false));
      navigation.replace('login');
    }, 1000);
  };
  const onConfirmDelete = async () => {
    handleModalClose();
    dispatch(show());
    try {
      const result: any = await deleteUser({phoneNumber, authToken});
      if (
        result.status === 404 ||
        result.status === 412 ||
        result.status === 401 ||
        result.status === 403
      ) {
        dispatch(hide());
        showAlert('warning', 'Delete account failed', 'Something went wrong');
      } else if (result.status === 200) {
        dispatch(hide());
        dispatch(resetForm());
        dispatch(logout());
        await EncryptedStorage.clear();
        showAlert('success', 'Delete Account', 'Successfully deleted account');
        await EncryptedStorage.clear();
        setTimeout(() => {
          dispatch(setAlertVisible(false));
          initialStackNavigation.replace('welcome');
        }, 1000);
      } else {
        dispatch(hide());
        showAlert('warning', 'Delete account failed', 'Something went wrong');
      }
    } catch (error: any) {
      dispatch(hide());
      showAlert('info', 'Delete account failed', 'Network error');
    }
  };
  const handleEditProfile = () => {
    onClose();
    profileNavigation.navigate('editProfileScreen');
  };
  const modalStyle = Platform.select({
    ios: styles.iosModal,
    android: styles.androidModal,
    default: styles.defaultModal,
  });
  return (
    <View>
      <Modal transparent={true} visible={visible}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={[styles.centeredView, modalStyle]}>
            <View style={styles.modalView}>
              <View style={styles.textContainer}>
                <TouchableOpacity
                  onPress={handleEditProfile}
                  style={styles.optionsView}>
                  <Text style={styles.modalText}>Edit Profile</Text>
                  <Image
                    source={pencil}
                    style={styles.image}
                    accessibilityHint="edit-image"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDeleteAccountConfirmation}
                  style={styles.optionsView}>
                  <Text style={styles.modalText}>Delete Account</Text>
                  <Image
                    source={bin}
                    style={styles.image}
                    accessibilityHint="bin-image"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleLogoutConfirmation}
                  style={styles.optionsView}>
                  <Text style={styles.modalText}>Logout</Text>
                  <Image
                    source={logoutImage}
                    style={styles.image}
                    accessibilityHint="logout-image"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {buttonTypes === 'Logout' && (
        <ConfirmModal
          visible={modalVisible}
          message={message}
          confirmText={buttonTypes}
          onClose={handleModalClose}
          onConfirm={onConfirmLogout}
        />
      )}
      {buttonTypes === 'Delete' && (
        <ConfirmModal
          visible={modalVisible}
          message={message}
          confirmText={buttonTypes}
          onClose={handleModalClose}
          onConfirm={onConfirmDelete}
        />
      )}
      <CustomAlert type={alertType} title={alertTitle} message={alertMessage} />
    </View>
  );
};
