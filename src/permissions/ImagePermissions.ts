import {Alert, Platform} from 'react-native';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';

export const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      const checkCamera = await check(PERMISSIONS.ANDROID.CAMERA);
      const checkExternalRead = await check(
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      );
      let permissionsDenied = false;

      if (checkCamera === RESULTS.DENIED) {
        const grantedCamera = await request(PERMISSIONS.ANDROID.CAMERA);
        if (grantedCamera !== RESULTS.GRANTED) {
          permissionsDenied = true;
        }
      }

      if (checkExternalRead === RESULTS.DENIED) {
        const grantedExternalRead = await request(
          PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        );
        if (grantedExternalRead !== RESULTS.GRANTED) {
          permissionsDenied = true;
        }
      }
      return permissionsDenied;
    } catch (e) {
      Alert.alert('Something went wrong while getting permission');
    }
  } else if (Platform.OS === 'ios') {
    try {
      const cameraStatus = await check(PERMISSIONS.IOS.CAMERA);
      const photoLibraryStatus = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
      const photoLibraryAddStatus = await check(
        PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
      );
      let permissionsDenied = false;

      if (cameraStatus === RESULTS.DENIED || RESULTS.LIMITED) {
        const grantedCamera = await request(PERMISSIONS.IOS.CAMERA);
        if (grantedCamera !== RESULTS.GRANTED) {
          permissionsDenied = true;
        }
      }

      if (photoLibraryStatus === RESULTS.DENIED || RESULTS.LIMITED) {
        const grantedExternal = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        if (grantedExternal !== RESULTS.GRANTED) {
          permissionsDenied = true;
        }
      }

      if (photoLibraryAddStatus === RESULTS.DENIED || RESULTS.LIMITED) {
        const grantedExternalRead = await request(
          PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
        );
        if (grantedExternalRead !== RESULTS.GRANTED) {
          permissionsDenied = true;
        }
      }
      return permissionsDenied;
    } catch (e) {
        Alert.alert('Something went wrong while getting permission');
      }
  }
};
