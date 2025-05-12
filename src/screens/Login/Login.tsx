import React, {useState} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {phone} from 'phone';
import PhoneInput from 'react-native-phone-input';
import {useNavigation} from '@react-navigation/native';
import {Button} from '../../components/Button/Button';
import {loginStyles} from './Login.styles';
import {Placeholder} from '../../components/InputField/InputField';
import {useThemeColors} from '../../constants/color';

type RootStackParamList = {
  register: undefined;
};

export type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'register'
>;
function Login() {
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
      <PhoneInput
        style={styles.phoneNumber}
        initialCountry={'in'}
        textProps={{
          placeholder: 'Phone number',
        }}
        onChangePhoneNumber={text => {
          setPhoneNumber(text);
        }}
        onPressFlag={() => {}}
      />

      {phoneNumber !== '' && !phone(phoneNumber).isValid && (
        <View style={styles.validationView}>
          <Text style={styles.validationText}>Phone number is not valid!</Text>
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

export default Login;
