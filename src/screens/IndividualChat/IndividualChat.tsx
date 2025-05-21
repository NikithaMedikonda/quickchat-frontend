import { View } from 'react-native';
import { IndividualChatHeader } from '../../components/IndividualChatHeader/IndividualChatHeader';
import { MessageInput } from '../../components/MessageInput/MessageInput';
import { useThemeColors } from '../../themes/colors';
import { UserDetails } from '../../types/user.types';
import { individualChatstyles } from './IndividualChat.styles';

export const IndividualChat = ({user}: {user: UserDetails}) => {
  const colors = useThemeColors();
  const styles = individualChatstyles(colors);
  return (
    <View style={styles.container}>
      <View>
        <IndividualChatHeader
          name={user.name}
          profilePicture={user.profilePicture}
        />
      </View>
      <View style={styles.InputContainer}>
        <MessageInput />
      </View>
    </View>
  );
};
