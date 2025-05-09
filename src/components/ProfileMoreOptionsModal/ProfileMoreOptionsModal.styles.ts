import {Dimensions, StyleSheet} from 'react-native';
import {colors} from '../../constants/color';

const {height} = Dimensions.get('window');

export const getStyles = (color: colors) =>
  StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      paddingTop: height * 0.19,
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
    },
    textContainer: {
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    optionsView: {
      display: 'flex',
      flexDirection: 'row',
      padding: 10,
    },
    binOptionsView: {
      gap: 20,
    },
    logoutOptionsView: {
      gap: 90,
    },
    editOptionsView: {
      gap: 55,
    },
    modalText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: color.text,
    },
  });
