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
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  await notifee.createChannel({
    id: 'quickchatbg',
    name: 'QuickChat Notifications',
    importance: AndroidImportance.HIGH,
    sound : 'custom_notification',
  });

    const rawPhnoneNumber = remoteMessage.data?.senderPhoneNumber;
    const senderPhoneNumber = typeof rawPhnoneNumber === 'string' ? rawPhnoneNumber : undefined;
    if (senderPhoneNumber) {
      await notifee.displayNotification({
        id: senderPhoneNumber,
        title:'QuickChat',
        body: 'New Message',
        android: {
          channelId: 'quickchat',
          smallIcon:'ic_stat_notification',
          pressAction: {
            id: 'default',
          },
        },
      });
    }
});

AppRegistry.registerComponent(appName, () => App);
