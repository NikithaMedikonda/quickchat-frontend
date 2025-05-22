import { Image, Linking, Platform, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ALERT_TYPE, AlertNotificationRoot, Dialog } from 'react-native-alert-notification';
import { useDispatch } from 'react-redux';
import { useThemeColors } from '../../themes/colors';
import { hide } from '../../store/slices/loadingSlice';
import { ContactDetails } from '../../types/contact.types';
import { DEFAULT_PROFILE_IMAGE } from '../../constants/defaultImage';
import { getStyles } from './Contact.styles';


export const Contact = ({contactDetails}: {contactDetails: ContactDetails}) => {
   const dispatch = useDispatch();
  const openSMS = async (phoneNumber: string, body: string) => {
    const url = `sms:${phoneNumber}${
      Platform.OS === 'android' ? '?body=' : '&body='
    }${body}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
        dispatch(hide());
    Dialog.show({
      type: ALERT_TYPE.DANGER,
      title: 'Contacts fetching is failed',
      textBody: 'Unable to process your request',
      button: 'close',
      closeOnOverlayTap: true,
    });
    }
  };

  const colors = useThemeColors();
  const styles = getStyles(colors);
  const {t} = useTranslation('contact');

  return (
    <AlertNotificationRoot
          theme="dark"
          colors={[
            {
              label: '#000000',
              card: '#FFFFFF',
              overlay: 'rgba(0, 0, 0, 0.5)',
              success: '#4CAF50',
              danger: '#F44336',
              warning: '#1877F2',
              info: '#000000',
            },
            {
              label: '#000000',
              card: '#FFFFFF',
              overlay: 'rgba(255, 255, 255, 0.5)',
              success: '#4CAF50',
              danger: '#F44336',
              warning: '#FFFFFF',
              info: '#000000',
            },
          ]}>
    <View style={styles.contactContainer}>
      <View style={styles.leftBlock}>
        <Image
          style={styles.image}
          source={{
            uri:
              contactDetails.profilePicture && !contactDetails.toBeInvited
                ? contactDetails.profilePicture
                : DEFAULT_PROFILE_IMAGE,
          }}
          accessibilityHint={contactDetails.profilePicture && !contactDetails.toBeInvited ? 'profile-image' : 'default-image'}
        />
        <View style={styles.nameNumberContainer}>
          <Text style={styles.text}>{contactDetails.name}</Text>
          <Text style={styles.text}>{contactDetails.phoneNumber}</Text>
        </View>
      </View>
      {contactDetails.toBeInvited && (
        <View>
          <Text
            onPress={async () =>
              await openSMS(
                contactDetails.phoneNumber,
                t(
                  "Welcome to Quick Chat. Let's have fun with this chating app",
                ),
              )
            }
            style={styles.inviteText}>
            {t('Invite')}
          </Text>
        </View>
      )}
    </View>
    </AlertNotificationRoot>
  );
};


