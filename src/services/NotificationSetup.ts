import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { PermissionsAndroid } from 'react-native';

export const setupNotificationChannel = async () => {
  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });
};

export const requestNotificationPermission = async () => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

export const getFCMToken = async (): Promise<string | null> => {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    return null;
  }

  await setupNotificationChannel();
  const token = await messaging().getToken();
  return token;
};

export const listenForForegroundMessages = () => {
  messaging().onMessage(async remoteMessage => {
    const { title, body } = remoteMessage.notification ?? {};
    if (title && body) {
      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId: 'default',
        },
      });
    }
  });
};
