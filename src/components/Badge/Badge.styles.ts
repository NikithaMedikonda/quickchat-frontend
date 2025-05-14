import { StyleSheet } from 'react-native';
import {Colors} from '../../constants/colors';
export const Badgestyles = (colors:Colors) =>
  StyleSheet.create({
   background: {
    position: 'absolute',
    top: -6,
    right: -6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: colors.primaryBlue,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  text: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
