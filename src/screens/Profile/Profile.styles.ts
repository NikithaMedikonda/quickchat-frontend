import {Dimensions, StyleSheet} from 'react-native';
import {Colors} from '../../constants/colors';
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
    profileImage: {
      height: height * 0.14,
      width: width * 0.3,
      borderRadius: 70,
      justifyContent: 'flex-start',

      padding: 10,
    },
    icons: {
      height: 30,
      width: 30,
      marginTop:10,
    },
    iconLast: {
      height: 35,
      width: 31,
      marginTop:10,
    },
    iconEmail: {
      height: 25,
      width: 25,
      marginLeft: 6,
      marginTop:10,
    },
    iconPhone: {
      height: 25,
      width: 25,
      marginLeft: 6,
      marginTop:10,
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
  });
