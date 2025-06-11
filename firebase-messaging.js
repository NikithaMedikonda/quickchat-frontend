import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  const senderNumber = remoteMessage.data.senderPhoneNumber;
  if (senderNumber) {
    await notifee.displayNotification({
      title: 'Quick Chat',
      body: `New Message from ${senderNumber}`,
      android: {
        channelId: 'quickchat',
        smallIcon: 'ic_stat_notification',
        pressAction: {
          id: 'default',
        },
      },
    });
  }
});
