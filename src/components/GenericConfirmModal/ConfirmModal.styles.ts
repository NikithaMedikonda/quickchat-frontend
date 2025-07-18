import {StyleSheet} from 'react-native';
import {Colors} from '../../themes/colors';

export const confirmModalStyles = (colors: Colors) => {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.modalOverlayBackground,
    },
    modal: {
      backgroundColor: colors.modalBackground,
      padding: 20,
      borderRadius: 10,
      width: '80%',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.3,
      shadowRadius: 4,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    message: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
      color: colors.text,
      fontWeight: '500',
    },
    warningText: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 16,
      fontWeight: 'bold',
      color: colors.warningColor,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    cancelButton: {
      backgroundColor: colors.text,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      flex: 1,
      alignItems: 'center',
      marginRight: 10,
    },
    confirmButton: {
      backgroundColor: colors.primaryBlue,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      flex: 1,
      alignItems: 'center',
    },
    cancelText: {
      color: 'black',
    },
    confirmText: {
      color: colors.buttonText,
    },
    image: {
      width: 48,
      height: 48,
      marginBottom: 16,
    },
  });
};
