import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { useDispatch, useSelector } from 'react-redux';
import { clearChatLocally } from '../../database/services/chatOperations';
import {
  deleteUserRestriction,
  insertUserRestriction,
} from '../../database/services/userRestriction';
import { deleteChat } from '../../services/DeleteChat';
import { blockUser } from '../../services/UserBlock';
import { unblockUser } from '../../services/UserUnblock';
import {
  setAlertMessage,
  setAlertTitle,
  setAlertType,
  setAlertVisible,
} from '../../store/slices/registrationSlice';
import { RootState } from '../../store/store';
import { useThemeColors } from '../../themes/colors';
import { useImagesColors } from '../../themes/images';
import { HomeTabsProps } from '../../types/usenavigation.type';
import { createChatId } from '../../utils/chatId';
import { CustomAlert } from '../CustomAlert/CustomAlert';
import { ConfirmModal } from '../GenericConfirmModal/ConfirmModal';
import { getStyles } from './ChatOptionsModal.styles';

type Props = {
  visible: boolean;
  onClose: () => void;
  isUserBlocked: boolean;
  onBlockStatusChange?: (isBlocked: boolean) => void;
  setIsCleared: (isCleared: boolean) => void;
};

export const ChatOptionsModal = ({
  visible,
  onClose,
  isUserBlocked,
  onBlockStatusChange,
  setIsCleared,
}: Props) => {
  const receiverPhoneNumber = useSelector(
    (state: RootState) => state.registration.receivePhoneNumber,
  );
  const dispatch = useDispatch();
  const homeNavigation = useNavigation<HomeTabsProps>();

  const {alertType, alertTitle, alertMessage} = useSelector(
    (state: RootState) => state.registration,
  );
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const {bin, chatblockImage} = useImagesColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [messages, setMessage] = useState('');
  const [buttonTypes, setButtonTypes] = useState('');

  const showConfirmation = (type: string, msg: string) => {
    onClose();
    setModalVisible(true);
    setButtonTypes(type);
    setMessage(msg);
  };

  const blockOrUnblockUser = () => {
    isUserBlocked
      ? showConfirmation(
          'Unblock',
          'Are you sure you want to unblock this user?',
        )
      : showConfirmation('Block', 'Are you sure you want to block this user?');
  };

  const showAlert = useCallback(
    (type: string, title: string, message: string) => {
      dispatch(setAlertType(type));
      dispatch(setAlertTitle(title));
      dispatch(setAlertMessage(message));
      dispatch(setAlertVisible(true));
    },
    [dispatch],
  );

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const onConfirmBlockOrUnblock = async () => {
    handleModalClose();
    try {
      const currentUser = await EncryptedStorage.getItem('user');
      const token = await EncryptedStorage.getItem('authToken');
      if (currentUser && token) {
        const userData = JSON.parse(currentUser);

        if (isUserBlocked) {
          const result = await unblockUser({
            blockerPhoneNumber: userData.phoneNumber,
            blockedPhoneNumber: receiverPhoneNumber,
            authToken: token,
          });
          if (result && result.status === 200) {
            onBlockStatusChange?.(false);
            await deleteUserRestriction(
              userData.phoneNumber,
              receiverPhoneNumber,
            );
          }
        } else {
          const result = await blockUser({
            blockerPhoneNumber: userData.phoneNumber,
            blockedPhoneNumber: receiverPhoneNumber,
            authToken: token,
          });
          if (result && result.status === 200) {
            onBlockStatusChange?.(true);
            await insertUserRestriction(
              userData.phoneNumber,
              receiverPhoneNumber,
            );
          }
        }
      }
    } catch (error) {
      showAlert('info', 'Network Error', 'Unable to block or unblock the user');
    }
  };

  const onConfirmDelete = async () => {
    handleModalClose();
    try {
      const currentUser = await EncryptedStorage.getItem('user');
      const token = await EncryptedStorage.getItem('authToken');

      if (currentUser && token) {
        const userData = JSON.parse(currentUser);
        const timestamp = Date.now();
        const result = await deleteChat({
          senderPhoneNumber: userData.phoneNumber,
          receiverPhoneNumber,
          timestamp,
          authToken: token,
        });

        if (result && (result.status === 200 || result.status === 204)) {
          const chatId = createChatId(
            userData.phoneNumber,
            receiverPhoneNumber,
          );
          await clearChatLocally(chatId, userData.phoneNumber, timestamp);
          setIsCleared(true);
          showAlert('success', 'Deleted', 'Chat deleted successfully.');
          setTimeout(() => {
            dispatch(setAlertVisible(false));
            homeNavigation.replace('hometabs');
          }, 1000);
        } else {
          showAlert('warning', 'Failed', 'Failed to delete the chat.');
        }
      }
    } catch (error) {
      showAlert('info', 'Network Error', 'Unable to delete the chat');
    }
  };

  const handleConfirm = () => {
    if (buttonTypes === 'Delete') {
      onConfirmDelete();
    } else {
      onConfirmBlockOrUnblock();
    }
  };

  const modalStyle = Platform.select({
    ios: styles.iosModal,
    android: styles.androidModal,
    default: styles.defaultModal,
  });

  return (
    <View>
      <Modal transparent={true} visible={visible}>
        <TouchableWithoutFeedback
          accessibilityHint="modal-closme-button"
          onPress={onClose}
          accessibilityLabel="modal-background">
          <View style={[styles.centeredView, modalStyle]}>
            <View style={styles.modalView}>
              <View style={styles.textContainer}>
                <TouchableOpacity
                  onPress={blockOrUnblockUser}
                  style={styles.optionsView}>
                  <Text style={styles.modalText}>
                    {isUserBlocked ? 'Unblock User' : 'Block User'}
                  </Text>
                  <Image
                    source={chatblockImage}
                    style={styles.blockImage}
                    accessibilityHint="block-user-icon"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    showConfirmation(
                      'Delete',
                      'Are you sure you want to delete this chat?',
                    )
                  }
                  style={styles.optionsView}>
                  <Text style={styles.modalText}>Delete Chat</Text>
                  <Image
                    source={bin}
                    style={styles.image}
                    accessibilityHint="delete-chat-icon"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ConfirmModal
        visible={modalVisible}
        message={messages}
        confirmText={buttonTypes}
        onClose={handleModalClose}
        onConfirm={handleConfirm}
      />
      <CustomAlert type={alertType} title={alertTitle} message={alertMessage} />
    </View>
  );
};
