import {Dimensions, StyleSheet} from 'react-native';
import {Colors} from '../../themes/colors';
const {width, height} = Dimensions.get('window');
export const getStyles = (color: Colors) =>
  StyleSheet.create({
    container: {
      display: 'flex',
      height: height,
      width: width,
      backgroundColor: color.background,
      paddingTop: height * 0.05,
    },
    profileDots: {
      height: 30,
      width: 30,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 6,
      marginRight: 12,
    },
    icons: {
      height: 35,
      width: 31,
      marginTop: 4,
      marginRight: -4,
    },
    iconLast: {
      height: 35,
      width: 35,
      marginTop: 2,
      marginRight: -8,
    },
    iconEmail: {
      height: 25,
      width: 25,
      marginLeft: 2,
      marginTop: 4,
    },
    iconPhone: {
      height: 25,
      width: 25,
      marginLeft: 1,
      marginTop: 6,
    },
    headerText: {
      color: color.text,
      fontWeight: '600',
      fontSize: 18,
    },
    detailsText: {
      color: color.gray,
      fontSize: 15,
    },
    innerContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentContainer: {
      padding: 30,
      display: 'flex',
      paddingTop: 50,
    },
    dataContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      gap: 50,
      padding: 15,
    },
    details: {
      display: 'flex',
      gap: 4,
    },
    profileImageContainer: {
      width: width * 0.3,
      height: width * 0.3,
      borderRadius: (width * 0.3) / 2,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#ccc',
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
  });
