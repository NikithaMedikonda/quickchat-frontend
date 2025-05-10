import { Alert, Platform } from 'react-native';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';

export const requestPermissions = async () => {
  let permissionsDenied = false;

  if (Platform.OS === 'android') {
    try {
      const checkCamera = await check(PERMISSIONS.ANDROID.CAMERA);
      const checkExternal = await check(
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      );
      const checkExternalRead = await check(
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      );

      if (checkCamera === RESULTS.DENIED) {
        const grantedCamera = await request(PERMISSIONS.ANDROID.CAMERA);
        if (grantedCamera !== RESULTS.GRANTED) {
          permissionsDenied = true;
        }
      }

      if (checkExternal === RESULTS.DENIED) {
        const grantedExternal = await request(
          PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        );
        if (grantedExternal !== RESULTS.GRANTED) {
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

      return !permissionsDenied;
    } catch (error: any) {
      Alert.alert('Error', 'Something went wrong while accessing permissions');
      return false;
    }
  } else if (Platform.OS === 'ios') {
    try {
      const cameraStatus = await check(PERMISSIONS.IOS.CAMERA);
      const photoLibraryStatus = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
      const photoLibraryAddStatus = await check(
        PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
      );

      if (cameraStatus === RESULTS.DENIED || cameraStatus === RESULTS.LIMITED) {
        const grantedCamera = await request(PERMISSIONS.IOS.CAMERA);
        if (grantedCamera !== RESULTS.GRANTED) {
          permissionsDenied = true;
        }
      }

      if (photoLibraryStatus === RESULTS.DENIED || photoLibraryStatus === RESULTS.LIMITED) {
        const grantedExternal = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        if (grantedExternal !== RESULTS.GRANTED) {
          permissionsDenied = true;
        }
      }

      if (photoLibraryAddStatus === RESULTS.DENIED || photoLibraryAddStatus === RESULTS.LIMITED) {
        const grantedExternalRead = await request(
          PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
        );
        if (grantedExternalRead !== RESULTS.GRANTED) {
          permissionsDenied = true;
        }
      }

      return !permissionsDenied;
    } catch (error: any) {
      Alert.alert('Error', 'Something went wrong while accessing permissions');
      return false;
    }
  }

  return false;
};
