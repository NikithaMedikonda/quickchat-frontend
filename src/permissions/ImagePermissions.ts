import { Alert, Platform } from 'react-native';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';

export const requestPermissions = async () => {
  let permissionsDenied = false;
  try {
    if (Platform.OS === 'android') {
      const permissionsToCheck = [
        PERMISSIONS.ANDROID.CAMERA,
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      ];

      for (const permission of permissionsToCheck) {
        const status = await check(permission);
        if (
          status === RESULTS.DENIED ||
          status === RESULTS.LIMITED ||
          status === RESULTS.BLOCKED
        ) {
          const result = await request(permission);
          if (result !== RESULTS.GRANTED) {
            permissionsDenied = true;
          }
        }
      }
    } else if (Platform.OS === 'ios') {
      const permissionsToCheck = [
        PERMISSIONS.IOS.CAMERA,
        PERMISSIONS.IOS.PHOTO_LIBRARY,
        PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
      ];

      for (const permission of permissionsToCheck) {
        const status = await check(permission);
        if (
          status === RESULTS.DENIED ||
          status === RESULTS.LIMITED ||
          status === RESULTS.BLOCKED
        ) {
          const result = await request(permission);
          if (result !== RESULTS.GRANTED) {
            permissionsDenied = true;
          }
        }
      }
    }

    return permissionsDenied;
  } catch (e) {
    Alert.alert(
      'Permission Error',
      'Something went wrong while getting permission'
    );
    return true;
  }
};
