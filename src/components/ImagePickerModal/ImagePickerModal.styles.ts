import {StyleSheet} from 'react-native';
import {Colors} from '../../themes/colors';

export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalView: {
      backgroundColor: colors.gray,
      borderRadius: 20,
      padding: 35,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    camera: {
      height: 50,
      width: 50,
    },
    gallery: {
      height: 50,
      width: 50,
    },
    innerContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
      gap: 30,
      padding: 30,
    },

    textContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    profileText: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    cancel: {
      height: 20,
      width: 20,
    },
  });
