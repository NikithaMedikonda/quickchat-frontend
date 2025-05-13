import {Dimensions, StyleSheet} from 'react-native';
import {Colors} from '../../constants/colors';

const {width, height} = Dimensions.get('window');

export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    contactContainer:{
        flex:1,
        backgroundColor:colors.background,
        left:0.05 * width,
        display:'flex',
        flexDirection:'row',
        justifyContent:'flex-start',
    },
    loadingContactsDisplay: {
      display: 'flex',
      flexDirection: 'row',
      alignItems:'center',
      justifyContent:'center',
      flex:1,
    },
    loadingContactsText:{
        color:colors.white,
    },
    nameNumberContainer:{
        display:'flex',
        flexDirection: 'column',
        gap:0.004 * height,
    },
    text:{
        color:colors.white,
        left:0.05 * width,
        fontWeight:'bold',
    },
    image:{
        height:35,
        width:35,
        borderRadius:30,
    },
    invitationContainer:{
        display:'flex',
        justifyContent:'center',
        left:0.4 * width,
    },
    inviteText:{
        color:colors.primaryBlue,
    },
  });
