import {StyleSheet, Dimensions} from 'react-native';
import { Colors } from '../../constants/colors.ts';

const {width, height} = Dimensions.get('window');

export const getStyles = (colors: Colors ) =>
    StyleSheet.create({
        container: {
            display: 'flex',
            height: height,
            width: width,
            backgroundColor: colors.background,
            paddingTop: width * 0.40,
        },
        innerContent: {
            width: width * 0.01,
            height: width * 0.01,
        },
        profileImage: {
           width: width * 0.13,
           height: width * 0.13,
           borderRadius: width * 0.10,
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
        },
    });
