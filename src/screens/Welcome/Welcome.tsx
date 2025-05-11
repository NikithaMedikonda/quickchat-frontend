import { View, Image } from 'react-native';
import { Button } from '../../components/Button/Button.tsx';
import { getStyles } from './Welcome.styles.ts';
import { NavigationProps } from '../../types/usenavigation.type.ts';
import { useThemeColors } from '../../constants/colors.ts';
import { useNavigation } from '@react-navigation/native';

export const Welcome = () => {
     const navigation = useNavigation<NavigationProps>();
    const colors = useThemeColors();
    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image style={styles.image} source={require('./../../assets/quickchat.png')} accessibilityHint="logo-image"/>
            </View>
            <View >
                <Button title="Get Started" onPress={() => navigation.navigate('register')} />
            </View>
        </View>
    );
};


