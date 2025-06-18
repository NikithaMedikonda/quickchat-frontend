/**
 * @format
 */
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import '@react-native-firebase/app';
import { App } from './App';
import { name as appName } from './app.json';
import './src/i18n/i18n.config';
import { numberNameIndex } from './src/helpers/nameNumberIndex';
import { normalise } from './src/helpers/normalisePhoneNumber';
import { DEFAULT_PROFILE_IMAGE } from './src/constants/defaultImage';
// import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  await notifee.createChannel({
    id: 'quickchat',
    name: 'Quick Chat Notifications',
    importance: AndroidImportance.HIGH,
  });

    const rawPhnoneNumber = remoteMessage.data?.senderPhoneNumber;
    const rawPhoto = remoteMessage.data?.profilePicture;
    const senderPhoneNumber = typeof rawPhnoneNumber === 'string' ? rawPhnoneNumber : undefined;
    const profilePicture = typeof rawPhoto === 'string' ? rawPhoto : undefined;
    let contactName;
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
    try {
      const storedCount = await AsyncStorage.getItem(`msgCount_${senderPhoneNumber}`);
      if (storedCount) {
        messageCount = parseInt(storedCount, 10) + 1;
      }
    } catch (e) {
      console.error('Error reading message count:', e);
    }
    await AsyncStorage.setItem(`msgCount_${senderPhoneNumber}`, messageCount.toString());
  }


    if (senderPhoneNumber || profilePicture) {
      await notifee.displayNotification({
        id: senderPhoneNumber,
        title:contactName,
        body: `${messageCount} new message${messageCount > 1 ? 's' : ''}`,
        android: {
          channelId: 'quickchat',
          smallIcon:'ic_stat_notification',
          largeIcon:profilePicture || DEFAULT_PROFILE_IMAGE,
          circularLargeIcon:true,
          pressAction: {
            id: 'default',
          },
        },
      });
    }
});

AppRegistry.registerComponent(appName, () => App);
