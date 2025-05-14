import {useEffect, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import {useThemeColors} from '../../constants/colors';
import {User} from '../../screens/Profile/Profile';

export const ProfileMoreOptionsModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const colors = useThemeColors();
  const styles = getStyles(colors);
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
        const userDataString = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('authToken');
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
    setModalVisible(true);
    setButtonTypes('Delete');
    setMessage(t('Are you sure want to delete this account?'));
    onClose();
  };
  const handleLogoutConfirmation = () => {
    setModalVisible(true);
    setButtonTypes('Logout');
    setMessage(t('Are you sure want to logout from this device?'));
    onClose();
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const onConfirmLogout = async () => {
    handleModalClose();
    dispatch(logout());
    const removeItems = ['user', 'authToken', 'refreshToken'];
    await AsyncStorage.multiRemove(removeItems);
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
    profileNavigation.navigate('editProfile');
  };
  return (
    <View>
      <Modal animationType="slide" transparent={true} visible={visible}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.textContainer}>
                <TouchableOpacity
                  onPress={handleDeleteAccountConfirmation}
                  style={[styles.binOptionsView, styles.optionsView]}>
                  <Text style={styles.modalText}>Delete Account</Text>
                  <Image
                    source={require('../../assets/bin.png')}
                    style={styles.image}
                    accessibilityHint="bin-image"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleLogoutConfirmation}
                  style={[styles.logoutOptionsView, styles.optionsView]}>
                  <Text style={styles.modalText}>Logout</Text>
                  <Image
                    source={require('../../assets/log-out.png')}
                    style={styles.image}
                    accessibilityHint="logout-image"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleEditProfile}
                  style={[styles.editOptionsView, styles.optionsView]}>
                  <Text style={styles.modalText}>Edit Profile</Text>
                  <Image
                    source={require('../../assets/edit.png')}
                    style={styles.image}
                    accessibilityHint="edit-image"
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
