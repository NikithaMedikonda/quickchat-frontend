import { Dimensions, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
const {width, height} = Dimensions.get('window');

export const getStyles = (colors: Colors) =>
  StyleSheet.create({
    input: {
      height: height * 0.055,
      fontSize: 20,
      borderRadius: 10,
      width: width * 0.8,
      padding: 10,
      color: colors.gray,
      margin: height * 0.012,
      backgroundColor: colors.white,
    },
    placeholder: {
      color: colors.gray,
    },
  });