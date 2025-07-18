import React from 'react';
import {
  Image,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';
import {useDispatch, useSelector} from 'react-redux';
import {DEFAULT_PROFILE_IMAGE} from '../../constants/defaultImage';
import {useThemeColors} from '../../themes/colors';
import {RootState} from '../../store/store';
import {
  setImage,
  setImageDeleted,
  setImageUri,
  setIsVisible,
  setAlertTitle,
  setAlertType,
  setAlertMessage,
  setAlertVisible,
} from '../../store/slices/registrationSlice';
import {updateProfilePicture} from '../../store/slices/loginSlice';
import {hide} from '../../store/slices/loadingSlice';
import {requestPermissions} from '../../permissions/ImagePermissions';
import {getStyles} from './ImagePickerModal.styles';
import { CustomAlert } from '../CustomAlert/CustomAlert';

export function ImagePickerModal({
  showDeleteOption = false,
}: {
  showDeleteOption?: boolean;
}) {
  const dispatch = useDispatch();
  const {alertType, alertTitle, alertMessage, isVisible} = useSelector(
    (state: RootState) => state.registration,
  );
  const showAlert = (type: string, title: string, message: string) => {
    dispatch(setAlertType(type));
    dispatch(setAlertTitle(title));
    dispatch(setAlertMessage(message));
    dispatch(setAlertVisible(true));
  };
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const user = useSelector((state: any) => state.login.user);
  const handleClose = () => {
    dispatch(setIsVisible(false));
  };

  const handleDeleteImage = async () => {
    dispatch(setImageUri(DEFAULT_PROFILE_IMAGE));
    dispatch(setImage(DEFAULT_PROFILE_IMAGE));
    dispatch(setImageDeleted(true));
    dispatch(updateProfilePicture({...user, profilePicture: ''}));
    handleClose();
  };

  const handlePickImage = async (from: 'camera' | 'gallery') => {
    const permissionsGranted = await requestPermissions(from);
    if (Platform.OS === 'android' && permissionsGranted) {
      dispatch(hide());
      showAlert(
        'warning',
        'Permission denied',
        'Permission Denied, We need access to your photos to continue.',
      );
      return;
    }
    if (Platform.OS === 'ios' && !permissionsGranted) {
      showAlert(
        'warning',
        'Permission denied',
        'Permission Denied, We need access to your photos to continue.',
      );
      return;
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
      dispatch(setImageDeleted(false));
      dispatch(setIsVisible(false));
    } catch (error: any) {
      handleClose();
      showAlert(
        'info',
        'Image selection failed',
        'You have not selected photo',
      );
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.textContainer}>
              <Text style={styles.profileText}>Choose Profile</Text>
              <TouchableOpacity onPress={handleClose}>
                <Image
                  style={styles.cancel}
                  source={require('../../assets/cross.png')}
                  accessibilityHint="cross-icon"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.innerContainer}>
              <TouchableOpacity
                accessibilityHint="camera-image-clicker"
                onPress={() => handlePickImage('camera')}>
                <Image
                  style={styles.camera}
                  accessibilityHint="camera-image"
                  source={require('../../assets/camera.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handlePickImage('gallery')}>
                <Image
                  accessibilityHint="gallery-image"
                  style={styles.gallery}
                  source={require('../../assets/gallery.png')}
                />
              </TouchableOpacity>
              {showDeleteOption && (
                <TouchableOpacity onPress={handleDeleteImage}>
                  <Image
                    accessibilityHint="delete-image"
                    style={styles.gallery}
                    source={require('../../assets/deleteImage.png')}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <CustomAlert type={alertType} title={alertTitle} message={alertMessage} />
    </Modal>
  );
}
