import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

export const getStyles = (colors: Colors) =>
    StyleSheet.create({
        container: {
            display: 'flex',
            height: height,
            width: width,
            backgroundColor: colors.background,
            paddingTop: width * 0.75,
        },
        description: {
            color: colors.gray,
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
        },
});
