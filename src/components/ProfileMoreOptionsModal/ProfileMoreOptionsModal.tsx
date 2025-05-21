import {useEffect, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {ConfirmModal} from '../GenericConfirmModal/ConfirmModal';
import {deleteUser} from '../../services/DeleteUser';
import {getStyles} from './ProfileMoreOptionsModal.styles';
import {hide, show} from '../../store/slices/loadingSlice';
import {
  InitialStackProps,
  NavigationProps,
  ProfileScreenNavigationProp,
} from '../../types/usenavigation.type';
import {logout} from '../../store/slices/loginSlice';
import {useDispatch} from 'react-redux';
import {useThemeColors} from '../../themes/colors';
import {useImagesColors} from '../../themes/images';
import {User} from '../../screens/Profile/Profile';
import {resetForm} from '../../store/slices/registrationSlice';

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
        Alert.alert(t('Invalid Phone number'));
      } else if (result.status === 200) {
        dispatch(hide());
        dispatch(resetForm());
        dispatch(logout());
        await EncryptedStorage.clear();
        initialStackNavigation.replace('welcome');
      } else if (result.status === 412) {
        dispatch(hide());
        Alert.alert(t('Invalid secret key'));
      } else if (result.status === 401) {
        dispatch(hide());
        Alert.alert(t('Invalid token'));
      } else if (result.status === 403) {
        dispatch(hide());
        Alert.alert(t('Authentication failed'));
      } else {
        dispatch(hide());
        Alert.alert(t('Something went wrong while deleting'));
      }
    } catch (error: any) {
      dispatch(hide());
      Alert.alert(t(`${error.message}`) || t('Something went wrong'));
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
  );
};
