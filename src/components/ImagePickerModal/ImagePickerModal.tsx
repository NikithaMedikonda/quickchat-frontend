import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useState} from 'react';

export default function ImagePickerModal() {
  const [modalVisible, setModalVisible] = useState(true);
  const handleModal = () => {
    setModalVisible(false);
  };
  return (
    <Modal animationType="slide" transparent={true} visible={modalVisible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.textContainer}>
            <Text style={styles.profileText}>Choose profile</Text>
            <TouchableOpacity onPress={handleModal}>
              <Text style={styles.cancel}>X</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.innerContainer}>
            <Image
              style={styles.camera} accessibilityHint="camera-image"
              source={require('../../assets/camera.png')}
            />
            <Image accessibilityHint="gallery-image"
              style={styles.gallery}
              source={require('../../assets/gallery.png')}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: '#898989',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  camera: {
    height: 50,
    width: 50,
  },
  gallery: {
    height: 50,
    width: 50,
  },
  innerContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 30,
    padding: 30,
  },

  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancel: {
    fontSize: 24,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});
