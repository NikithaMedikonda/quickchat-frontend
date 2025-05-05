import { View, StyleSheet, Image, Button } from 'react-native'
import React from 'react'

const WelcomeScreen = () => {
    return (
        <View style={styles.container}>
            <Image style={styles.image} source={require('../../assets/images/quickchat_logo.png')}
                testID="logo-image"
            />
            <View>
                <Button title="Get Started" />
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