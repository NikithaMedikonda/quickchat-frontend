import {Image, Text, View} from 'react-native';
import {DEFAULT_PROFILE_IMAGE} from '../../constants/defaultImage';
import {useThemeColors} from '../../themes/colors';
import {MessageStatusTicks} from '../MessageStatusTicks/MessageStatusTicks';
import {getStyles} from './ChatBoxContent.styles';

export const ChatBoxContent = ({
  image,
  name,
  description,
  status,
}: {
  image?: string | null;
  name: string;
  description: string;
  status?: 'sent' | 'delivered' | 'read';
}) => {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.innerContent}>
        <Image
          style={styles.profileImage}
          source={image ? {uri: image} : {uri: DEFAULT_PROFILE_IMAGE}}
          accessibilityHint="profile-image"
        />
      </View>
      <View style={styles.details}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.descriptionWrapper}>
          {status && <MessageStatusTicks status={status}/>}
          <Text
            style={styles.description}
            numberOfLines={1}
            ellipsizeMode="tail">
            {' '}{description}
          </Text>
        </View>
      </View>
    </View>
  );
};
