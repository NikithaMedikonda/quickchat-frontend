import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

messaging().setBackgroundMessageHandler(async remoteMessage => {
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
