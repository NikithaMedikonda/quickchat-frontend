import {useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import {ConfirmModal} from '../GenericConfirmModal/ConfirmModal';
import {getStyles} from './ChatOptionsModal.styles';
import {useImagesColors} from '../../themes/images';
import {useThemeColors} from '../../themes/colors';

type Props = {
  visible: boolean;
  onClose: () => void;
  isBlocked: boolean;
};

export const ChatOptionsModal = ({visible, onClose, isBlocked}: Props) => {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const {bin, chatblockImage} = useImagesColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [buttonTypes, setButtonTypes] = useState('');

  const showConfirmation = (type: 'Block' | 'Delete', msg: string) => {
    onClose();
    setModalVisible(true);
    setButtonTypes(type);
    setMessage(msg);
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
                  onPress={() =>
                    showConfirmation(
                      'Block',
                      'Are you sure you want to block this user?',
                    )
                  }
                  style={styles.optionsView}>
                  <Text style={styles.modalText}>
                    {isBlocked ? 'Unblock User' : 'Block User'}
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
