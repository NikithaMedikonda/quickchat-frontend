import '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
} from '@notifee/react-native';
import {PermissionsAndroid, Platform} from 'react-native';
import {numberNameIndex} from '../helpers/nameNumberIndex';
import {normalise} from '../helpers/normalisePhoneNumber';
import {DEFAULT_PROFILE_IMAGE} from '../constants/defaultImage';
import AsyncStorage from '@react-native-async-storage/async-storage';


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
    const senderPhoneNumber =
      typeof rawPhnoneNumber === 'string' ? rawPhnoneNumber : undefined;
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

    let messageCount = 1;

    if (senderPhoneNumber) {
        const storedCount = await AsyncStorage.getItem(
          `msgCount_${senderPhoneNumber}`,
        );
        if (storedCount) {
          messageCount = parseInt(storedCount, 10) + 1;
        }
      await AsyncStorage.setItem(
        `msgCount_${senderPhoneNumber}`,
        messageCount.toString(),
      );
    }
    if (senderPhoneNumber || profilePicture) {
      await notifee.displayNotification({
        id: senderPhoneNumber,
        title: contactName,
        body: `${messageCount} new message${messageCount > 1 ? 's' : ''}`,
        android: {
          channelId: 'quickchat',
          smallIcon: 'ic_stat_notification',
          largeIcon: profilePicture || DEFAULT_PROFILE_IMAGE,
          pressAction: {
            id: 'default',
          },
        },
      });
    }
  });
};
