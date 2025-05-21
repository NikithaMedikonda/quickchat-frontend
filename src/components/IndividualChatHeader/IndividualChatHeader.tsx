import { Image, Platform, Text, View } from 'react-native';
import { useThemeColors } from '../../themes/colors';
import { UserDetails } from '../../types/user.types';
import { individualChatHeaderStyles } from './IndividualChatHeader.styles';

export const IndividualChatHeader = ({name, profilePicture}: UserDetails) => {
  const colors = useThemeColors();

  const styles = individualChatHeaderStyles(colors);
  return (
    <View style={styles.content}>
      <Image
        source={
          Platform.OS === 'ios'
            ? require('../../assets/iOS-back-arrow.png')
            : require('../../assets/android-back-arrow.png')
        }
        accessibilityHint="back-arrow-icon"
        style={styles.backArrow}
       />
       <Image source={{uri: profilePicture}} style={styles.profilePicture} accessibilityHint="profile-picture" />
       <Text style={styles.userName} accessibilityHint="username-text">{name}</Text>
       <Image
        source={require('../../assets/more-options-icon.png')}
        style={styles.moreOptionsIcon}
        accessibilityHint="more-options-icon"
       />
    </View>
  );
};
