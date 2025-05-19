import { Dimensions,StyleSheet } from 'react-native';
import { Colors } from '../../themes/colors';

const { width, height } = Dimensions.get('window');

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
