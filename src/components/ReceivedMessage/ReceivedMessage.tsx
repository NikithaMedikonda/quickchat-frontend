import { Text, View } from 'react-native';
import { TimeStamp } from '../TimeStamp/TimeStamp';

import { useThemeColors } from '../../themes/colors';
import { ReceivedMessageProps } from '../../types/messsage.types';
import { receivedMessageStyles } from './ReceivedMessage.styles';

export const ReceivedMessage = ({receivedMessages}: ReceivedMessageProps) => {
  const colors = useThemeColors();
  const styles = receivedMessageStyles(colors);

  return (
    <View>
      {receivedMessages.map((message, index) => (
        <View key={index} style={styles.receivedMessageContainer}>
          <Text style={styles.receivedMessageText}>{message.text}</Text>
          <TimeStamp messageTime={message.timestamp} />
        </View>
      ))}
    </View>
  );
};
