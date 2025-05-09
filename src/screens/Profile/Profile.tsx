import React from 'react';
import {View, Image, Text} from 'react-native';
import {getStyles} from './Profile.styles';
import {useThemeColors} from '../../constants/color';

export const Profile = () => {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Image
          source={require('../../assets/profile-img.jpeg')}
          accessibilityHint="profile-image"
          style={styles.profileImage}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.dataContainer}>
          <Image
            source={require('../../assets/firstname.png')}
            style={styles.icons}
            accessibilityHint="firstname-image"
          />
          <View style={styles.details}>
            <Text style={styles.headerText}>First Name</Text>
            <Text style={styles.detailsText}>Anoosha</Text>
          </View>
        </View>
        <View style={styles.dataContainer}>
          <Image
            source={require('../../assets/lastname.png')}
            style={styles.iconLast}
            accessibilityHint="lastname-image"
          />
          <View style={styles.details}>
            <Text style={styles.headerText}>Last Name</Text>
            <Text style={styles.detailsText}>Sanugula</Text>
          </View>
        </View>
        <View style={styles.dataContainer}>
          <Image
            source={require('../../assets/email.png')}
            style={styles.iconEmail}
            accessibilityHint="email-image"
          />
          <View style={styles.details}>
            <Text style={styles.headerText}>Email</Text>
            <Text style={styles.detailsText}>anoosha@gmail.com</Text>
          </View>
        </View>
        <View style={styles.dataContainer}>
          <Image
            source={require('../../assets/phone.png')}
            style={styles.iconPhone}
            accessibilityHint="phone-image"
          />
          <View style={styles.details}>
            <Text style={styles.headerText}>Phone</Text>
            <Text style={styles.detailsText}>9876543256</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
