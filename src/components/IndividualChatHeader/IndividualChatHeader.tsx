import {Image, Platform, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useThemeColors} from '../../themes/colors';
import {individualChatHeaderStyles} from './IndividualChatHeader.styles';
import {HomeStackProps} from '../../types/usenavigation.type';
import {UserDetails} from '../../types/user.types';

export const IndividualChatHeader = ({name, profilePicture}: UserDetails) => {
  const colors = useThemeColors();
  const navigation = useNavigation<HomeStackProps>();
  const styles = individualChatHeaderStyles(colors);
  return (
    <View style={styles.content}>
      <TouchableOpacity
        onPress={() => {
          navigation.goBack();
        }}>
        <Image
          source={
            Platform.OS === 'ios'
              ? require('../../assets/iOS-back-arrow.png')
              : require('../../assets/android-back-arrow.png')
          }
          accessibilityHint="back-arrow-icon"
          style={styles.backArrow}
        />
      </TouchableOpacity>
      <Image
        source={{uri: profilePicture}}
        style={styles.profilePicture}
        accessibilityHint="profile-picture"
      />
      <Text style={styles.username} accessibilityHint="username-text">
        {name}
      </Text>
      <Image
        source={require('../../assets/more-options-icon.png')}
        style={styles.moreOptionsIcon}
        accessibilityHint="more-options-icon"
      />
    </View>
  );
};
