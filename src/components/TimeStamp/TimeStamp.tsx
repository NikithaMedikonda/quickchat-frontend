import {Text, View} from 'react-native';
import moment from 'moment';
import {Timestampstyle} from './TimeStamp.styles';
import {useThemeColors} from '../../constants/colors';

export const TimeStamp = ({
  messageTime,
}: {
  messageTime: Date | string | null;
}) => {
  const colors = useThemeColors();
  const styles = Timestampstyle(colors);
  let displayTime = null;
   const currentTime = moment();
  const messageReceivedTime = moment(messageTime);
  if (!messageTime || !moment(messageTime).isValid()) {
    return (
      <View>
        <Text style={styles.color}>---</Text>
      </View>
    );
  }
  if (messageReceivedTime.isSame(currentTime, 'day')) {
    displayTime = messageReceivedTime.format('h:mm a');
  } else if (
    messageReceivedTime.isSame(
      moment().startOf('day').subtract(1, 'days'),
      'day',
    )
  ) {
    displayTime = 'Yesterday';
  } else if (messageReceivedTime.isAfter(moment().subtract(7, 'days'))){
    displayTime = messageReceivedTime.format('dddd');
  } else {
    displayTime = messageReceivedTime.format('MMM D, YYYY');
  }
  return (
    <View>
      <Text style={styles.color}>{displayTime}</Text>
    </View>
  );
};
