import { View, StyleSheet, Image } from 'react-native'
import React from 'react'
import { useNavigate } from 'react-router-native';
import { Button } from '../../components/Button';

const WelcomeScreen = () => {
    const navigate = useNavigate();

    return (
        <View style={styles.container}>
            <Image style={styles.image} source={require('../../assets/images/quickchat_logo.png')}
                testID="logo-image"
            />
            <View>
                <Button title="Get Started" onPress={() => navigate('/register')}/>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        backgroundColor: "black",
        flex: 1
    },
    image: {
        position: "relative",
        width: 270,
        height: 270,
        top: 150
    },
})
export default WelcomeScreen