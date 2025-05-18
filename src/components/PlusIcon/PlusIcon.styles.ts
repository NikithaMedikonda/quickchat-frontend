import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');
import { Colors } from '../../constants/colors';

export const getStyles = (colors: Colors) =>
    StyleSheet.create({
        innerContainer: {
            alignItems: 'center',
            justifyContent:'center',
            width: width * 0.15,
            height: height * 0.07,
            borderRadius:10,
            backgroundColor:colors.primaryBlue,
        },
        plusImage: {
            width: width * 0.1,
            height: height * 0.05,
        },
    });
