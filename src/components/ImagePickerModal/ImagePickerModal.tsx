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
import ImageCropPicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';
import {useDispatch, useSelector} from 'react-redux';
import {
  setImageUri,
  setImage,
  setIsVisible,
} from '../../store/slices/registrationSlice';
import {getStyles} from './ImagePickerModal.styles';
import {requestPermissions} from '../../permissions/ImagePermissions';
import {RootState} from '../../store/store';
import {useThemeColors} from '../../constants/colors';

export function ImagePickerModal() {
  const dispatch = useDispatch();
  const {isVisible} = useSelector((state: RootState) => state.registration);
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const handleClose = () => {
    dispatch(setIsVisible(false));
  };

  const handlePickImage = async (from: 'camera' | 'gallery') => {
    const permissionsGranted = await requestPermissions(from);
    if (Platform.OS === 'android' && permissionsGranted) {
      Alert.alert(
        'Permission Denied',
        'We need access to your photos to continue.',
      );
      return;
    }
    if (Platform.OS === 'ios' && !permissionsGranted) {
      Alert.alert(
        'Permission Denied',
        'We need access to your photos to continue.',
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
      dispatch(setIsVisible(false));
    } catch (error: any) {
      handleClose();
      Alert.alert('Error', error?.message || 'Image selection failed.');
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.textContainer}>
              <Text style={styles.profileText}>
                Choose Profile
              </Text>
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
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
