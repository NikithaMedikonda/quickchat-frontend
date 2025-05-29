import moment from 'moment';
import { Text, View } from 'react-native';
import { useThemeColors } from '../../themes/colors';
import { Timestampstyle } from './TimeStamp.styles';

export const TimeStamp = ({
  messageTime,
  isSent,
}: {
  messageTime: Date | string;
  isSent: boolean;
}) => {
  const colors = useThemeColors();
  const styles = Timestampstyle(colors);
  let displayTime;
  const currentTime = moment();
  const messageReceivedTime = moment(messageTime);
  if (messageReceivedTime.isSame(currentTime, 'day')) {
    displayTime = messageReceivedTime.format('h:mm A');
  } else if (
    messageReceivedTime.isSame(
      moment().startOf('day').subtract(1, 'days'),
      'day',
    )
  ) {
    displayTime = 'Yesterday';
  } else if (messageReceivedTime.isAfter(moment().subtract(7, 'days'))) {
    displayTime = messageReceivedTime.format('dddd');
  } else {
    displayTime = messageReceivedTime.format('MMM D, YYYY');
  }
  return (
    <View>
      <Text style={!isSent ? styles.color : styles.sentColor}>
        {displayTime}
      </Text>
    </View>
  );
};
