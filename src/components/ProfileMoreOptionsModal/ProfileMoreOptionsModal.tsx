import React from 'react';
import {View, Text, Modal, TouchableOpacity, Image} from 'react-native';
import {getStyles} from './ProfileMoreOptionsModal.styles';
import {useThemeColors} from '../../constants/color';

export const ProfileMoreOptionsModal = ({visible, onClose}:{visible:boolean,onClose:()=>void}) => {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.textContainer}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.binOptionsView, styles.optionsView]}>
              <Text style={styles.modalText}>Delete Account</Text>
              <Image
                source={require('../../assets/bin.png')}
                style={styles.image}
                accessibilityHint="bin-image"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.logoutOptionsView, styles.optionsView]}>
              <Text style={styles.modalText}>Logout</Text>
              <Image
                source={require('../../assets/log-out.png')}
                style={styles.image}
                accessibilityHint="logout-image"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
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
