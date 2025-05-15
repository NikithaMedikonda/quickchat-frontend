import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const getStyles = () =>
    StyleSheet.create({
        innerContainer: {
            alignItems: 'flex-end',
            width: width * 0.90,
            paddingTop: height * 0.25,
            height: height * 0.90,
        },
        plusImage: {
            width: width * 0.18,
            height: height * 0.14,
        },
    });
