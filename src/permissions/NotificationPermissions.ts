import '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
} from '@notifee/react-native';
import {PermissionsAndroid, Platform} from 'react-native';

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
    const senderPhoneNumber =
      remoteMessage.data && remoteMessage.data.senderPhoneNumber
        ? remoteMessage.data.senderPhoneNumber
        : '';
    console.log(senderPhoneNumber);
    await notifee.displayNotification({
      title: 'Quick Chat',
      body: `New Message from ${senderPhoneNumber}`,
      android: {
        channelId: 'quickchat',
        smallIcon: 'ic_stat_notification',
        pressAction: {
          id: 'default',
        },
      },
    });
  });
};
