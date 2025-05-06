import { Dimensions, StyleSheet } from "react-native";
const { width, height } = Dimensions.get('window');
export const getStyles = (colors: any) =>
  StyleSheet.create({
    logo:{
      height:height*0.17,
      width:width*0.37,
    },
    registrationMainContainer:{
      backgroundColor:colors.background,
      justifyContent:"center",
      alignItems:"center",
      height:height,
      width:width
    },
    loginButtonContainer:{
    marginTop:height*0.015,
    display:"flex",
    flexDirection:"row"
    },
    loginButtontext:{
    color:colors.text
    },
    loginButtonSignInText:{
    color:colors.primaryBlue
    }
  });


