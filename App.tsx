import React from 'react';
import { SafeAreaView, Text, StyleSheet, Dimensions } from 'react-native';
import { Registration } from './src/screens/Registration/Registration.tsx';
export const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Registration/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
