import { Alert, Image, Linking, Platform, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ContactDetails } from '../../types/contact.types';
import { DEFAULT_PROFILE_IMAGE } from '../../constants/defaultImage';
import { getStyles } from './Contact.styles';
import { useThemeColors } from '../../themes/colors';

export const Contact = ({contactDetails}: {contactDetails: ContactDetails}) => {
  const openSMS = async (phoneNumber: string, body: string) => {
    const url = `sms:${phoneNumber}${
      Platform.OS === 'android' ? '?body=' : '&body='
    }${body}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Unable to process the request');
    }
  };

  const colors = useThemeColors();
  const styles = getStyles(colors);
  const {t} = useTranslation('contact');

  return (
    <View style={styles.contactContainer}>
      <View>
        {contactDetails.toBeInvited ? (
          <Image
            style={styles.image}
            source={{uri: DEFAULT_PROFILE_IMAGE}}
            accessibilityHint="default-image"
          />
        ) : (
          <Image
            style={styles.image}
            source={{uri: contactDetails.profilePicture || DEFAULT_PROFILE_IMAGE}}
            accessibilityHint="profile-image"
          />
        )}
      </View>
      <View style={styles.nameNumberContainer}>
        <Text style={styles.text}>{contactDetails.name}</Text>
        <Text style={styles.text}>{contactDetails.phoneNumber}</Text>
      </View>
      {contactDetails.toBeInvited && (
        <View style={styles.invitationContainer}>
          <Text
            onPress={async () => {
              await openSMS(
                contactDetails.phoneNumber,
                `${t('Welcome to Quick Chat. Let\'s have fun with this chating app')}`,
              );
            }}
            style={styles.inviteText}>
            {t('Invite')}
          </Text>
        </View>
      )}
    </View>
  );
};
