import React from 'react';
import { View, Text, StyleSheet} from 'react-native';
import ImagePickerModal from './src/components/ImagePickerModal/ImagePickerModal';

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>QuickChat</Text>
      <ImagePickerModal/>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E90FF',
  },
});
