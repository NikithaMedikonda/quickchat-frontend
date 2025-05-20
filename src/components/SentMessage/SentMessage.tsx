import {Text, View, Image} from 'react-native';
import {TimeStamp} from '../TimeStamp/TimeStamp';

import {useThemeColors} from '../../themes/colors';
import {sentMessageStyles} from './SentMessage.styles';
import { SentMessageProps } from '../../types/messsage.types';

export const SentMessage = ({ sentMessages }: SentMessageProps) => {
  const colors = useThemeColors();
  const styles = sentMessageStyles(colors);

  const MessageStatus: { [key: string]: any } = {
    SENT: require('../../assets/single-tick.png'),
    DELIVERED: require('../../assets/double-ticks.png'),
    READ: require('../../assets/blue-ticks.png'),
  };
  return (
    <View>
      {sentMessages.map((message, index) => (
        <View key={index} style={styles.sentMessageContainer}>
          <Text style={styles.sentMessageText}>{message.text}</Text>
          <TimeStamp messageTime={message.timestamp} />
          <Image
            source={MessageStatus[message.status]}
            style={styles.tickIcon}
            accessibilityHint="message-status-tick"
          />
        </View>
      ))}
    </View>
  );
};
