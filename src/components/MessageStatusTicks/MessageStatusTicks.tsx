import React from 'react';
import { StyleSheet, Text } from 'react-native';
interface Props {
  status: 'sent' | 'delivered' | 'read' | string;
}
export const MessageStatusTicks = ({status}: Props) => {
  switch (status) {
    case 'sent':
      return <Text style={styles.tick}>✓</Text>;
    case 'delivered':
      return <Text style={styles.tick}>✓✓</Text>;
    case 'read':
      return <Text style={[styles.tick, styles.readTick]}>✓✓</Text>;
    default:
      return null;
  }
};
const styles = StyleSheet.create({
  tick: {
    fontSize: 12,
    color: '#A9A9A9',
    marginLeft: 4,
  },
  readTick: {
    color: '#FFFFFF',
  },
});
