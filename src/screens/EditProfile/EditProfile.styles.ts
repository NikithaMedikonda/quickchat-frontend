import {StyleSheet} from 'react-native';
import {Colors} from '../../themes/colors';

export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      padding: 20,
      paddingBottom: 40,
      backgroundColor: colors.background,
      flexGrow: 1,
      justifyContent: 'flex-start',
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      alignSelf: 'center',
      marginBottom: 20,
      borderWidth: 2,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 20,
      color: colors.text,
    },
    fieldContainer: {
      marginBottom: 16,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fieldTextContainer: {
      display: 'flex',
      flexDirection:'row',
      width: '85%',

    },
    label: {
      fontSize: 19,
      fontWeight: '500',
      color: colors.gray,
      marginBottom: 6,
      alignSelf: 'center',
    },
    errorText: {
      color: colors.primaryBlue,
      fontSize: 12,
      marginTop: 4,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 20,
      gap: 10,
    },
    touchableButton: {
      backgroundColor: colors.primaryBlue,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      flex: 0,
      width: '48%',
    },
    buttonText: {
      color: colors.buttonText,
      fontWeight: '600',
      fontSize: 16,
    },
    dotsImage: {
      height: 30,
      width: 30,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 6,
      marginRight: 12,
    },
    keyboardView:{
    flex: 1,
    },
  });
