import React, { useState } from 'react';
import {Modal, View, Text, TouchableOpacity} from 'react-native';
import {confirmModalStyles} from './ConfirmModal.styles';

interface ConfirmModalProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  setVisible,
  message,
  confirmText = 'Yes',
  onConfirm,
}) => {

  const onCancel = () => {
    setVisible(false);
  };

  const styles = confirmModalStyles();

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export { ConfirmModal };
