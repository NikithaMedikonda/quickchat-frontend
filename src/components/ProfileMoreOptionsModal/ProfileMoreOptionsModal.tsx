import {View, Text, Modal, TouchableOpacity, Image} from 'react-native';
import {getStyles} from './ProfileMoreOptionsModal.styles';
import {useThemeColors} from '../../constants/colors';
import {useDispatch} from 'react-redux';
import {logout} from '../../store/slices/loginSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {NavigationProps} from '../../types/usenavigation.type';

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
  const navigation: NavigationProps = useNavigation();
  const handleDeleteAccount = () => {
    onClose();
  };
  const handleLogout = async () => {
    onClose();
    dispatch(logout());
    const removeItems = ['user', 'authToken', 'refreshToken'];
    await AsyncStorage.multiRemove(removeItems);
    navigation.replace('login');
  };
  const handleEditProfile = () => {
    onClose();
  };
  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.textContainer}>
            <TouchableOpacity
              onPress={handleDeleteAccount}
              style={[styles.binOptionsView, styles.optionsView]}>
              <Text style={styles.modalText}>Delete Account</Text>
              <Image
                source={require('../../assets/bin.png')}
                style={styles.image}
                accessibilityHint="bin-image"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
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
    </Modal>
  );
};
