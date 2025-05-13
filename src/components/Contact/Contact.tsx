import {View, Text, Image} from 'react-native';
import {ContactDetails} from '../../types/contact.types';
import {DEFAULT_PROFILE_IMAGE} from '../../constants/defaultImage';
import {getStyles} from './Contact.styles';
import {useThemeColors} from '../../constants/colors';


export const Contact = ({contactDetails}: {contactDetails: ContactDetails}) => {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  return (
    <View style={styles.contactContainer}>
      <View>
        {contactDetails.toBeInvited ? (
          <Image style={styles.image} source={{uri: DEFAULT_PROFILE_IMAGE}} accessibilityHint='default-image' />
        ) : (
          <Image
            style={styles.image}
            source={{uri: contactDetails.profilePic}}
            accessibilityHint='profile-image'
          />
        )}
      </View>
      <View>
        <Text style={styles.text}>{contactDetails.name}</Text>
        <Text style={styles.text}>{contactDetails.phoneNumber}</Text>
      </View>
      {contactDetails.toBeInvited && (
        <View style={styles.invitationContainer}>
          <Text style={styles.inviteText}>Invite</Text>
        </View>
      )}
    </View>
  );
};
