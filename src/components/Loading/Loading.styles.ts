import { StyleSheet } from 'react-native';

export const loadingComponentStyles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    elevation: 10,
  },
  spinner: {
    color: 'white',
  },
});
