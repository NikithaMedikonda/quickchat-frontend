import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import RNFS from 'react-native-fs';
import ImageCropPicker from 'react-native-image-crop-picker';
import {useDispatch, useSelector} from 'react-redux';
import {
  setImageUri,
  setImage,
  setIsVisible,
} from '../../store/slices/registrationSlice';
import {requestPermissions} from '../../permissions/ImagePermissions';
import {imagePickerModalStyles} from './ImagePickerModal.styles';
import {RootState} from '../../store/store';

export function ImagePickerModal() {
  const dispatch = useDispatch();
  const {isVisible} = useSelector((state: RootState) => state.registration);

  const handleClose = () => {
    dispatch(setIsVisible(false));
  };

  const handlePickImage = async (from: 'camera' | 'gallery') => {
    const permissionDenied = await requestPermissions();
    if (permissionDenied) {
      Alert.alert(
        'Permission Denied',
        'We need access to your photos to continue.',
      );
    }
    try {
      const pickedImage =
        from === 'camera'
          ? await ImageCropPicker.openCamera({
              width: 300,
              height: 300,
              cropping: true,
              includeBase64: false,
            })
          : await ImageCropPicker.openPicker({
              width: 300,
              height: 300,
              cropping: true,
              includeBase64: false,
            });

      const base64Image = await RNFS.readFile(pickedImage.path, 'base64');
      const imageData = `data:image/jpeg;base64,${base64Image}`;

      dispatch(setImageUri(pickedImage.path));
      dispatch(setImage(imageData));
    } catch (error: any) {
      Alert.alert(error);
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={imagePickerModalStyles.centeredView}>
          <View style={imagePickerModalStyles.modalView}>
            <View style={imagePickerModalStyles.textContainer}>
              <Text style={imagePickerModalStyles.profileText}>
                Choose Profile
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Image
                  style={imagePickerModalStyles.cancel}
                  source={require('../../assets/cross.png')}
                  accessibilityHint="cross-icon"
                />
              </TouchableOpacity>
            </View>

            <View style={imagePickerModalStyles.innerContainer}>
              <TouchableOpacity
                accessibilityHint="camera-image-clicker"
                onPress={() => handlePickImage('camera')}>
                <Image
                  style={imagePickerModalStyles.camera}
                  accessibilityHint="camera-image"
                  source={require('../../assets/camera.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handlePickImage('gallery')}>
                <Image
                  accessibilityHint="gallery-image"
                  style={imagePickerModalStyles.gallery}
                  source={require('../../assets/gallery.png')}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
