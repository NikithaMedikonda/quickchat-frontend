import {Platform, Alert} from 'react-native';
import {request, PERMISSIONS, RESULTS, check} from 'react-native-permissions';

export const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      // Check the status of each permission
      const checkCamera = await check(PERMISSIONS.ANDROID.CAMERA);
      const checkExternal = await check(
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      );
      const checkExternalRead = await check(
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      );

      // If any permission is denied, request the denied permissions
      let permissionsDenied = false;

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
      return permissionsDenied;
    } catch (e:any) {
      Alert.alert(e);
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
    } catch (err: any) {
      Alert.alert(err);
    }
  }
};
