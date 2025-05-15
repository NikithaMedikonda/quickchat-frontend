import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
export const Timestampstyle = (colors: Colors) =>
   StyleSheet.create({
      color: {
         color: colors.text,
      },
   });
