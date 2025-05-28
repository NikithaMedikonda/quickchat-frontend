import {Dimensions, StyleSheet} from 'react-native';
import {Colors} from '../../themes/colors';

const {height} = Dimensions.get('window');

export const getStyles = (color: Colors) =>
  StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      backgroundColor: color.modalOverlayBackground,
    },
    iosModal: {
      paddingTop: height * 0.15,
      paddingRight: height * 0.02,
    },
    androidModal: {
      paddingTop: height * 0.09,
      paddingRight: height * 0.04,
    },
    defaultModal: {
      paddingTop: height * 0.15,
      paddingRight: height * 0.02,
    },
    modalView: {
      backgroundColor: color.primaryBlue,
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    image: {
      height: 20,
      width: 20,
      marginRight: 5,
    },
    blockImage: {
      height: 20,
      width: 20,
      marginRight: 5,
    },
    textContainer: {
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    optionsView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 10,
      width: 200,
    },
    modalText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: color.profileOptionsText,
    },
  });
