import {useState} from 'react';
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
import {getStyles} from './ChatOptionsModal.styles';
import {useThemeColors} from '../../themes/colors';
import {useImagesColors} from '../../themes/images';
import {ConfirmModal} from '../GenericConfirmModal/ConfirmModal';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const ChatOptionsModal = ({visible, onClose}: Props) => {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const {bin, chatblockImage} = useImagesColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [buttonTypes, setButtonTypes] = useState('');

  const handleBlockUserConfirmation = () => {
    onClose();
    setModalVisible(true);
    setButtonTypes('Block');
    setMessage('Are you sure you want to block this user?');
  };

  const handleDeleteChatConfirmation = () => {
    onClose();
    setModalVisible(true);
    setButtonTypes('Delete');
    setMessage('Are you sure you want to delete this chat?');
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const onConfirmBlock = () => {
    handleModalClose();
  };

  const onConfirmDelete = () => {
    handleModalClose();
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
          onPress={onClose}
          accessibilityLabel="modal-background">
          <View style={[styles.centeredView, modalStyle]}>
            <View style={styles.modalView}>
              <View style={styles.textContainer}>
                <TouchableOpacity
                  onPress={handleBlockUserConfirmation}
                  style={styles.optionsView}>
                  <Text style={styles.modalText}>Block User</Text>
                  <Image
                    source={chatblockImage}
                    style={styles.blockImage}
                    accessibilityHint="block-user-icon"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDeleteChatConfirmation}
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
      {buttonTypes === 'Block' && (
        <ConfirmModal
          visible={modalVisible}
          message={message}
          confirmText={buttonTypes}
          onClose={handleModalClose}
          onConfirm={onConfirmBlock}
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
