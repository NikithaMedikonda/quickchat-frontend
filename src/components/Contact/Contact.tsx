import { Image, Linking, Platform, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useThemeColors } from '../../themes/colors';
import { hide } from '../../store/slices/loadingSlice';
import { ContactDetails } from '../../types/contact.types';
import { DEFAULT_PROFILE_IMAGE } from '../../constants/defaultImage';
import { setAlertMessage, setAlertTitle, setAlertType, setAlertVisible } from '../../store/slices/registrationSlice';
import { CustomAlert } from '../CustomAlert/CustomAlert';
import { RootState } from '../../store/store';
import { getStyles } from './Contact.styles';


export const Contact = ({contactDetails}: {contactDetails: ContactDetails}) => {
   const dispatch = useDispatch();
   const {alertType, alertTitle, alertMessage} = useSelector(
    (state: RootState) => state.registration,
  );
     const showAlert = (type: string, title: string, message: string) => {
       dispatch(setAlertType(type));
       dispatch(setAlertTitle(title));
       dispatch(setAlertMessage(message));
       dispatch(setAlertVisible(true));
     };
  const openSMS = async (phoneNumber: string, body: string) => {
    const url = `sms:${phoneNumber}${
      Platform.OS === 'android' ? '?body=' : '&body='
    }${body}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
        dispatch(hide());
        showAlert('info', 'Contacts fetching is failed', 'Unable to process your request.');
    }
  };

  const colors = useThemeColors();
  const styles = getStyles(colors);
  const {t} = useTranslation('contact');

  return (

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
                  "Welcome to QuickChat. Let's have fun with this chating app",
                ),
              )
            }
            style={styles.inviteText}>
            {t('Invite')}
          </Text>
        </View>
      )}
        <CustomAlert type={alertType} title={alertTitle} message={alertMessage} />
    </View>
  );
};


