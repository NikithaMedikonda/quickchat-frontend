import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import sentImage from '../../assets/sent.png';
import deliveredImage from '../../assets/delivered.png';
import readImage from '../../assets/readTick.png';

interface Props {
  status: 'sent' | 'delivered' | 'read' | string;
}

export const MessageStatusTicks = ({ status }: Props) => {
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
    default:
      return null;
  }
  return (
    <View style={styles.container}>
      <Image accessibilityHint={`Message status is ${status}`} source={source} style={styles.tickImage} resizeMode="contain" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 4,
  },
  tickImage: {
    width: 18,
    height: 18,
  },
});
