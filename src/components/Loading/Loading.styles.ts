import { StyleSheet } from 'react-native';

export const loadingComponentStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  spinner: {
    color: 'white',
  },
});
