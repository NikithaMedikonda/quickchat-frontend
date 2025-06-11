import '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
} from '@notifee/react-native';
import {PermissionsAndroid, Platform} from 'react-native';
import {numberNameIndex} from '../helpers/nameNumberIndex';
import {normalise} from '../helpers/normalisePhoneNumber';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } else {
    const settings = await notifee.requestPermission();
    return (
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
    );
  }
};


export const setupNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'quickchat',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });
  }
};

export const getFCMToken = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermission();

    if (!hasPermission) {
      return null;
    }
    await messaging().registerDeviceForRemoteMessages();
    const fcmToken = await messaging().getToken();
    return fcmToken;
  } catch (error) {
    return null;
  }
};
export const listenForForegroundMessages = () => {
  return messaging().onMessage(async remoteMessage => {

    const title = remoteMessage.data?.title;
    const rawBody = remoteMessage.data?.body;
    const body =
      typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
    const index = await numberNameIndex();
    if (title && body && index) {
      const normalisedBody = normalise(body);
      const name = index[normalisedBody] || body;

      await notifee.displayNotification({
        title: 'Quick Chat',
        body: `New Message from ${name}`,
        android: {
          channelId: 'quickchat',
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
      });
    }
  });
};
