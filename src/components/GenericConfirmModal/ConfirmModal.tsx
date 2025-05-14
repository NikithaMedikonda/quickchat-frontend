import React from 'react';

import {useThemeColors} from '../../constants/colors';

import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

import {confirmModalStyles} from './ConfirmModal.styles';
import {useTranslation} from 'react-i18next';

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

  const onCancel = () => {
    setVisible(false);
  };
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
