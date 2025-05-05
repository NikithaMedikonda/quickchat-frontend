import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const WelcomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text>WelcomeScreen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      backgroundColor:"black",
      flex:1
    },
})
export default WelcomeScreen