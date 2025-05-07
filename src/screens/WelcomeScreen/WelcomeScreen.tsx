import {Button} from '../../components/Button';
import {colors} from '../../constants/colors';
import React from 'react';
import {RegisterScreenNavigationProp} from '../../types/usenavigation.type';
import {useThemeColors} from '../../constants/colors';
import {useNavigation} from '@react-navigation/native';
import {View, StyleSheet, Image, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

export const WelcomeScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={require('./../../../assets/quickchat.png')}
          accessibilityHint="logo-image"
        />
      </View>
      <View>
        <Button
          title="Get Started"
          onPress={() => navigation.navigate('register')}
        />
      </View>
    </View>
  );
};

// eslint-disable-next-line @typescript-eslint/no-shadow
export const getStyles = (colors: colors) =>
  StyleSheet.create({
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      height: height,
      width: width,
    },
    image: {
      width: width * 0.5,
      height: height * 0.3,
    },

    imageContainer: {
      height: height * 0.6,
      width: width * 0.9,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
