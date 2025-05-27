import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {confirmModalStyles} from './ConfirmModal.styles';
import {useThemeColors} from '../../themes/colors';
import warning from '../../assets/warning-2.png';

interface ConfirmModalProps {
  visible: boolean;
  message: string;
  confirmText?: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  message,
  confirmText = 'Yes',
  onClose,
  onConfirm,
}) => {
  const colors = useThemeColors();
  const styles = confirmModalStyles(colors);
  const {t} = useTranslation('profile');
  if (!visible) {
    return null;
  }

  return (
    <View>
      <Modal transparent visible={visible} animationType="fade">
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <Image source={warning} style={styles.image} />
              <Text style={styles.message}>{message}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelText}>{t('Cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={onConfirm}>
                  <Text style={styles.confirmText}>{t(`${confirmText}`)}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export {ConfirmModal};
