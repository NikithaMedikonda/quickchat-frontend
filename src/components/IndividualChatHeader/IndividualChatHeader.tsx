import {useNavigation} from '@react-navigation/native';
import {Image, Platform, Text, TouchableOpacity, View} from 'react-native';

import {useThemeColors} from '../../themes/colors';
import {useImagesColors} from '../../themes/images';
import {HomeStackProps} from '../../types/usenavigation.type';
import {UserDetails} from '../../types/user.types';
import {individualChatHeaderStyles} from './IndividualChatHeader.styles';

export const IndividualChatHeader = ({name, profilePicture}: UserDetails) => {
  const colors = useThemeColors();
  const {androidBackArrow, iOSBackArrow} = useImagesColors();
  const navigation = useNavigation<HomeStackProps>();
  const styles = individualChatHeaderStyles(colors);
  return (
    <View style={styles.content}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}>
          <Image
            source={Platform.OS === 'android' ? androidBackArrow : iOSBackArrow}
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
      </View>

      <Image
        source={require('../../assets/more-options-icon.png')}
        style={styles.moreOptionsIcon}
        accessibilityHint="more-options-icon"
      />
    </View>
  );
};
