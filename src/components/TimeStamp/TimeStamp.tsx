import moment from 'moment';
import { Text, View } from 'react-native';
import { useThemeColors } from '../../themes/colors';
import { Timestampstyle } from './TimeStamp.styles';

export const TimeStamp = ({
  messageTime,
  isSent,
  showFullTime = false,
}: {
  messageTime: Date | string;
  isSent: boolean;
  showFullTime?: boolean;
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
    displayTime = showFullTime
      ? `Yesterday, ${messageReceivedTime.format('h:mm A')}`
      : 'Yesterday';
  } else if (messageReceivedTime.isAfter(moment().subtract(7, 'days'))) {
    displayTime = showFullTime
      ? messageReceivedTime.format('dddd, h:mm A')
      : messageReceivedTime.format('dddd');
  } else {
     displayTime = showFullTime
      ? messageReceivedTime.format('MMM D, YYYY, h:mm A')
      : messageReceivedTime.format('MMM D, YYYY');
  }
  return (
    <View>
      <Text style={!isSent ? styles.color : styles.sentColor}>
        {displayTime}
      </Text>
    </View>
  );
};
