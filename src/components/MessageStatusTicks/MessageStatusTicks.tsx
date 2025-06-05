import { Image, StyleSheet, View } from 'react-native';
import deliveredImage from '../../assets/delivered.png';
import pendingImage from '../../assets/pendingDark.png';
import readImage from '../../assets/readTick.png';
import sentImage from '../../assets/sent.png';

interface Props {
  status: 'sent' | 'delivered' | 'read' | string;
}

export const MessageStatusTicks = ({status}: Props) => {
  let source;

  switch (status) {
    case 'sent':
      source = sentImage;
      break;
    case 'delivered':
      source = deliveredImage;
      break;
    case 'read':
      source = readImage;
      break;
    case 'pending':
      source = pendingImage;
      break;
    default:
      return null;
  }
  return (
    <View style={styles.container}>
      <Image
        accessibilityHint={`Message status is ${status}`}
        source={source}
        style={styles.tickImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingRight: 5,
  },
  tickImage: {
    width: 18,
    height: 18,
  },
});
