import { useEffect, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ALERT_TYPE, AlertNotificationRoot, Dialog } from 'react-native-alert-notification';
import { ConfirmModal } from '../GenericConfirmModal/ConfirmModal';
import { hide, show } from '../../store/slices/loadingSlice';
import { logout } from '../../store/slices/loginSlice';
import { resetForm } from '../../store/slices/registrationSlice';
import { deleteUser } from '../../services/DeleteUser';
import {
  InitialStackProps,
  NavigationProps,
  ProfileScreenNavigationProp,
} from '../../types/usenavigation.type';
import { User } from '../../screens/Profile/Profile';
import { useThemeColors } from '../../themes/colors';
import { useImagesColors } from '../../themes/images';
import { getStyles } from './ProfileMoreOptionsModal.styles';


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
    await EncryptedStorage.clear();
    navigation.replace('login');
  };
  const onConfirmDelete = async () => {
    handleModalClose();
    dispatch(show());
    try {
      const result: any = await deleteUser({phoneNumber, authToken});
      if (result.status === 404) {
        dispatch(hide());
         Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: 'Invalid Phone number',
          button: 'close',
          closeOnOverlayTap: true,
        });
      } else if (result.status === 200) {
        dispatch(hide());
        dispatch(resetForm());
        dispatch(logout());
        await EncryptedStorage.clear();
        initialStackNavigation.replace('welcome');
      } else if (result.status === 412) {
        dispatch(hide());
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: 'Invalid secret key',
          button: 'close',
          closeOnOverlayTap: true,
        });
      } else if (result.status === 401) {
        dispatch(hide());
          Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: 'Invalid token',
          button: 'close',
          closeOnOverlayTap: true,
        });
      } else if (result.status === 403) {
        dispatch(hide());
        dispatch(hide());
          Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: 'Authentication failed',
          button: 'close',
          closeOnOverlayTap: true,
        });
      } else {
        dispatch(hide());
         Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: 'Something went wrong while deleting',
          button: 'close',
          closeOnOverlayTap: true,
        });
      }
    } catch (error: any) {
      dispatch(hide());
      Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: 'Something went wrong!',
          button: 'close',
          closeOnOverlayTap: true,
        });
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
    <AlertNotificationRoot
          theme="dark"
          colors={[
            {
              label: '#000000',
              card: '#FFFFFF',
              overlay: 'rgba(0, 0, 0, 0.5)',
              success: '#4CAF50',
              danger: '#F44336',
              warning: '#1877F2',
              info: '#000000',
            },
            {
              label: '#000000',
              card: '#FFFFFF',
              overlay: 'rgba(255, 255, 255, 0.5)',
              success: '#4CAF50',
              danger: '#F44336',
              warning: '#FFFFFF',
              info: '#000000',
            },
          ]}>
    <View>
      <Modal transparent={true} visible={visible}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={[styles.centeredView, modalStyle]}>
            <View style={styles.modalView}>
              <View style={styles.textContainer}>
                <TouchableOpacity
                  onPress={handleEditProfile}
                  style={ styles.optionsView}>
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
                  style={ styles.optionsView}>
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
    </View>
    </AlertNotificationRoot>
  );
};
