import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../constants/colors.ts';

const { width, height } = Dimensions.get('window');

export const getStyles = (colors: Colors) =>
    StyleSheet.create({
        container: {
            display: 'flex',
            height: height * 0.06,
            width: width * 0.75,
            backgroundColor: colors.background,
        },
        innerContent: {
            width: width * 0.01,
            height: width * 0.01,
        },
        profileImage: {
            width: width * 0.12,
            height: height * 0.06,
            borderRadius: width * 0.9,
        },
        details: {
            paddingLeft: width * 0.16,
            gap: 8,
        },
        name: {
            color: colors.text,
            fontSize: 16,
            fontWeight: 'bold',
        },
        description: {
            color: colors.text,
            fontSize: 13,
            width: width * 0.55,
        },
    });
