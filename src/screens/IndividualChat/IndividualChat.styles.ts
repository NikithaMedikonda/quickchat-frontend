import { StyleSheet } from 'react-native';
import { Colors } from '../../themes/colors';

export const individualChatstyles = (colors: Colors) => {
  return StyleSheet.create({
    container: {
      display:'flex',
      flex: 1,
      backgroundColor: colors.background,
    },
    InputContainer:{
     flex: 1,
     justifyContent: 'flex-end',
     marginBottom: 17,
    },
  });
};
