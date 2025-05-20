import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { IndividualChatHeader } from '../../components/IndividualChatHeader/IndividualChatHeader';
import { MessageInput } from '../../components/MessageInput/MessageInput';
import { ReceivedMessage } from '../../components/ReceivedMessage/ReceivedMessage';
import { SentMessage } from '../../components/SentMessage/SentMessage';
import { useThemeColors } from '../../constants/colors';
import { Message, ReceivedMessagetype } from '../../types/messsage.types';
import { userDetails } from '../../types/user.types';
import { individualChatstyles } from './IndividualChat.styles';

export const IndividualChat = ({user}: {user: userDetails}) => {
  const colors = useThemeColors();
  const styles = individualChatstyles(colors);
  // Prefix with underscore to silence ESLint/TS warnings while keeping them for future use
  const [sentMessages, _setSentMessages] = useState<Message[]>([]);
  const [receivedMessages, _setReceivedMessages] = useState<
    ReceivedMessagetype[]
  >([]);
  return (
    <View style={styles.container}>
      <View>
        <IndividualChatHeader
          name={user.name}
          profilePicture={user.profilePicture}
        />
      </View>
      <ScrollView accessibilityHint="message-container">
        <SentMessage sentMessages={sentMessages} />
        <ReceivedMessage receivedMessages={receivedMessages} />
      </ScrollView>
      <View style={styles.InputContainer}>
        <MessageInput />
      </View>
    </View>
  );
};
