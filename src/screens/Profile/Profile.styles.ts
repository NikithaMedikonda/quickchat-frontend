import {Dimensions, StyleSheet} from 'react-native';
import {Colors} from '../../constants/color';
const {width, height} = Dimensions.get('window');
export const getStyles = (color: Colors) =>
  StyleSheet.create({
    container: {
      display: 'flex',
      height: height,
      width: width,
      backgroundColor: color.background,
      paddingTop: height * 0.19,
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
    },
    iconLast: {
      height: 35,
      width: 31,
    },
    iconEmail: {
      height: 25,
      width: 25,
      marginLeft: 6,
    },
    iconPhone: {
      height: 25,
      width: 25,
      marginLeft: 6,
    },
    headerText: {
      color: color.text,
      fontWeight: '600',
    },
    detailsText: {
      color: color.gray,
    },
    innerContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentContainer: {
      padding: 30,
      display: 'flex',
      paddingTop: 30,
    },
    dataContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      gap: 40,
      padding: 15,
    },
    details: {
      display: 'flex',
      gap: 2,
    },
  });
