import { Alert, Platform } from 'react-native';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';

export const requestPermissions = async (from: string) => {
  let permissionsDenied = false;
  if (Platform.OS === 'android') {
    try {
      if (from === 'camera') {
        const checkCamera = await check(PERMISSIONS.ANDROID.CAMERA);
        if (checkCamera === RESULTS.DENIED) {
          const grantedCamera = await request(PERMISSIONS.ANDROID.CAMERA);
          if (grantedCamera !== RESULTS.GRANTED) {
            permissionsDenied = true;
          }
        }
      } else {
        const checkExternalRead = await check(
          PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        );

        if (checkExternalRead === RESULTS.DENIED) {
          console.log('HELLO', checkExternalRead);
          const grantedExternalRead = await request(
            PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
          );
          console.log('checking', grantedExternalRead);
          if (grantedExternalRead !== RESULTS.GRANTED) {
            permissionsDenied = true;
          }
        }
      }
      return permissionsDenied;
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while accessing permissions');
      return false;
    }
  } else {
    try {
      if (from === 'camera') {
        const cameraStatus = await check(PERMISSIONS.IOS.CAMERA);
        if (
          cameraStatus === RESULTS.DENIED ||
          cameraStatus === RESULTS.LIMITED
        ) {
          const grantedCamera = await request(PERMISSIONS.IOS.CAMERA);
          if (grantedCamera !== RESULTS.GRANTED) {
            permissionsDenied = true;
          }
        }
      } else {
        const photoLibraryStatus = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
        if (
          photoLibraryStatus === RESULTS.DENIED ||
          photoLibraryStatus === RESULTS.LIMITED
        ) {
          const grantedExternal = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
          if (grantedExternal !== RESULTS.GRANTED) {
            permissionsDenied = true;
          }
        }
      }
      return !permissionsDenied;
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while accessing permissions');
      return false;
    }
  }
};
