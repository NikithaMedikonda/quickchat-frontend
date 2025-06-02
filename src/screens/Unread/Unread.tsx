import {Text, View} from 'react-native';
import { useDeviceCheck } from '../../services/useDeviceCheck';
export const Unread = () => {
  useDeviceCheck();
  return (
    <View>
      <Text>Hello unread</Text>
    </View>
  );
};
