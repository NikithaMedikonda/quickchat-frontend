import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { numberNameIndex } from './src/helpers/nameNumberIndex';
import { normalise } from './src/helpers/normalisePhoneNumber';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  const title = remoteMessage.data?.title;
  const body = remoteMessage.data?.body;

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
