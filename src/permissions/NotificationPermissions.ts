import notifee, {
  AndroidImportance,
  AuthorizationStatus,
} from '@notifee/react-native';
import '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { numberNameIndex } from '../helpers/nameNumberIndex';
import { normalise } from '../helpers/normalisePhoneNumber';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const androidVersion = Platform.Version as number;

    if (androidVersion >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
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
    const rawPhnoneNumber = remoteMessage.data?.senderPhoneNumber;
    const rawPhoto = remoteMessage.data?.profilePicture;
    const senderPhoneNumber = typeof rawPhnoneNumber === 'string' ? rawPhnoneNumber : undefined;
    const profilePicture = typeof rawPhoto === 'string' ? rawPhoto : undefined;


    let contactName: string | undefined;

    if (senderPhoneNumber) {
      try {
        const nameIndex = await numberNameIndex();
        const normalizedSender = normalise(senderPhoneNumber);
        contactName = nameIndex?.[normalizedSender] || senderPhoneNumber;
      } catch (error) {
        contactName = senderPhoneNumber;
      }
    }


    if (senderPhoneNumber || profilePicture) {
      await notifee.displayNotification({
        title:contactName,
        body: 'New message',
        android: {
          channelId: 'quickchat',
          smallIcon:'ic_stat_notification',
          largeIcon:profilePicture,
          pressAction: {
            id: 'default',
          },
        },
      });
    }
  });
};
