import {useNavigation} from '@react-navigation/native';
import {useState} from 'react';
import {Image, Platform, Text, TouchableOpacity, View} from 'react-native';
import {DEFAULT_PROFILE_IMAGE} from '../../constants/defaultImage';
import {useThemeColors} from '../../themes/colors';
import {useImagesColors} from '../../themes/images';
import {HomeStackProps} from '../../types/usenavigation.type';
import {UserDetails} from '../../types/user.types';
import {ChatOptionsModal} from '../ChatOptionsModal/ChatOptionsModal';
import {individualChatHeaderStyles} from './IndividualChatHeader.styles';

interface IndividualChatHeaderProps extends UserDetails {
  isBlocked: boolean;
  socketId: String | null;
  onBlockStatusChange: (isBlocked: boolean) => void;
  setIsCleared: (isCleared: boolean) => void;
  setSocketId: (socketId: string | null) => void;
}

export const IndividualChatHeader = ({
  name,
  profilePicture,
  isBlocked,
  onBlockStatusChange,
  setIsCleared,
  socketId,
}: IndividualChatHeaderProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const colors = useThemeColors();
  const {profileDots} = useImagesColors();
  const {androidBackArrow, iOSBackArrow} = useImagesColors();
  const navigation = useNavigation<HomeStackProps>();
  const styles = individualChatHeaderStyles(colors);

  const modelVisible = () => {
    setModalVisible(true);
  };

  const onClose = () => {
    setModalVisible(false);
  };
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
          source={{uri: profilePicture || DEFAULT_PROFILE_IMAGE}}
          style={styles.profilePicture}
          accessibilityHint="profile-picture"
        />
        <View style={styles.nameWithBadgeContainer}>
          <Text style={styles.username} accessibilityHint="username-text">
            {name}
          </Text>
          {socketId != null && (
            <Text
              accessibilityHint="online-status"
              style={styles.onlineIndicator}>
              online
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity onPress={modelVisible}>
        <Image
          source={profileDots}
          style={styles.moreOptionsIcon}
          accessibilityHint="more-options-icon"
        />
      </TouchableOpacity>
      <ChatOptionsModal
        visible={modalVisible}
        onClose={onClose}
        isUserBlocked={isBlocked}
        onBlockStatusChange={onBlockStatusChange}
        setIsCleared={setIsCleared}
      />
    </View>
  );
};
