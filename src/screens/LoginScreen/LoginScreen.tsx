import React, {useState} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Button} from '../../components/Button/Button';
import {Placeholder} from '../../components/InputField/InputField';
import {loginStyles} from './Login.styles';
import {useThemeColors} from '../../constants/color';


type RootStackParamList = {
  register: undefined;
};

export type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'register'
>;
function LoginScreen() {
  const colors = useThemeColors();
  const styles = loginStyles(colors);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigation<RegisterScreenNavigationProp>();
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require('./../../../assets/quickchat.png')}
        accessibilityHint="logo-image"
      />
      <Placeholder
        title="Phone number"
        value={phoneNumber}
        onChange={value => {
          setPhoneNumber(value);
        }}
        secureTextEntry={false}
      />
      {phoneNumber !== '' && phoneNumber.length !== 10 && (
        <View style={styles.validationView}>
          <Text style={styles.validationText}>Phone number not exists!</Text>
        </View>
      )}
      <Placeholder
        title="Password"
        value={password}
        onChange={value => {
          setPassword(value);
        }}
        secureTextEntry={true}
      />
      <Button title="Login" onPress={() => {}} />
      <View style={styles.messageView}>
        <Text style={styles.messageText}>Don't have an account?</Text>
        <TouchableOpacity
          style={styles.signUpContainer}
          onPress={() => {
            navigate.navigate('register');
          }}>
          <Text style={styles.validationText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default LoginScreen;
