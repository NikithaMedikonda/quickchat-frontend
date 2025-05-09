import React from 'react';
import { View, Image } from 'react-native';
import { useNavigate } from 'react-router-native';

import { Button } from '../../components/Button/Button.tsx';
import { useThemeColors } from '../../constants/colors.ts';
import { getStyles } from './Welcome.styles.ts';


export const WelcomeScreen = () => {
    const navigate = useNavigate();
    const colors = useThemeColors();
    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image style={styles.image} source={require('./../../../assets/quickchat.png')} accessibilityHint="logo-image"/>
            </View>
            <View >
                <Button title="Get Started" onPress={() => navigate('/register')} />
            </View>
        </View>
    );
};


