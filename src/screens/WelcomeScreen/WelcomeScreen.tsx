import { View, StyleSheet, Image, Dimensions } from 'react-native'
import React from 'react'
import { useNavigate } from 'react-router-native';
import {Button}  from '../../components/Button';
import { useThemeColors } from '../../constants/color';
const { width,height } = Dimensions.get('window');


export const WelcomeScreen = () => {
    const navigate = useNavigate();
    const colors = useThemeColors();
    const styles = getStyles(colors);


    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
            <Image style={styles.image} source={require('../../assets/images/quickchat_logo.png')}
                testID="logo-image"
            />
            </View>
            <View >
            <Button title="Get Started" onPress={() => navigate('/register')}/>
            </View>
         
        </View>
    )
}

export const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
        display:"flex",
        justifyContent:"center",
        alignItems: "center",
        backgroundColor:colors.background,
        height:height,
        width:width,

    },
    image: {
        width: width*0.5,
        height: height*0.3,
    },

    imageContainer:{
        height:height*0.6,
        width:width*0.9,
        display:"flex",
        justifyContent:"center",
        alignItems:"center"
    }
  });
