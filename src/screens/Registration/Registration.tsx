import React, { useState } from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {Button} from '../../components/Button.tsx';
import {Placeholder} from '../../components/InputField.tsx';
import {getStyles} from './Registration.ts';
import {useThemeColors} from '../../constants/colors.ts';

export const Registration = () => {
    const [userImage, setUserImage] = useState("../../assets/image.png")
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const fields = [
    'First Name',
    'Last Name',
    'Phone Number',
    'Password',
    'Confirm Password',
    'Email (Optional)',
  ];

  return (
    <View style={styles.registrationMainContainer}>
      <TouchableOpacity>
        <Image
          style={styles.logo}
          src={userImage}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {fields.map((label, index) => (
        <Placeholder key={index} title={label} />
      ))}
      <Button title="Register" />
      <View style={styles.loginButtonContainer}>
        <Text style={styles.loginButtontext}>Already have an account? </Text>
        <TouchableOpacity>
          <Text style={styles.loginButtonSignInText}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
