import {useEffect, useLayoutEffect, useState} from 'react';
import {View, Image, Text, TouchableOpacity} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {getStyles} from './Profile.styles';
import {ProfileMoreOptionsModal} from '../../components/ProfileMoreOptionsModal/ProfileMoreOptionsModal';
import {useThemeColors} from '../../constants/colors';

export interface User {
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  email: string;
  phoneNumber: string;
  isDeleted: boolean;
}
export const Profile = () => {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const {t} = useTranslation('auth');
  const [userData, setUserData] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const handleMoreOptionsModal = () => {
    setModalVisible(true);
  };
  const onClose = () => {
    setModalVisible(false);
  };
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitleAlign: 'center',
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleMoreOptionsModal}>
            <Image
              source={require('../../assets/dots.png')}
              accessibilityHint="dots-image"
              style={styles.dotsImage}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, styles.dotsImage, styles.headerRight]);
  useEffect(() => {
    const getUserData = async () => {
      const userDataString = await EncryptedStorage.getItem('user');
      if (userDataString) {
        const userDataParsed: User = JSON.parse(userDataString);
        setUserData(userDataParsed);
      }
    };
    getUserData();
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {userData?.profilePicture && (
          <Image
            source={{uri: `${userData?.profilePicture}`}}
            accessibilityHint="profile-image"
            style={styles.profileImage}
          />
        )}
        {!userData?.profilePicture && (
          <Image
            source={{
              uri: 'https://sdjetntpocezxjoelxgb.supabase.co/storage/v1/object/public/quick-chat/images/profile-pics/image.png',
            }}
            accessibilityHint="profile-image"
            style={styles.profileImage}
          />
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.dataContainer}>
          <Image
            source={require('../../assets/firstname.png')}
            style={styles.icons}
            accessibilityHint="firstname-image"
          />
          <View style={styles.details}>
            <Text style={styles.headerText}>{t('First Name')}</Text>
            <Text style={styles.detailsText}>{userData?.firstName}</Text>
          </View>
        </View>
        <View style={styles.dataContainer}>
          <Image
            source={require('../../assets/lastname.png')}
            style={styles.iconLast}
            accessibilityHint="lastname-image"
          />
          <View style={styles.details}>
            <Text style={styles.headerText}>{t('Last Name')}</Text>
            <Text style={styles.detailsText}>{userData?.lastName}</Text>
          </View>
        </View>
        {userData?.email && (
          <View style={styles.dataContainer}>
            <Image
              source={require('../../assets/email.png')}
              style={styles.iconEmail}
              accessibilityHint="email-image"
            />
            <View style={styles.details}>
              <Text style={styles.headerText}>{t('Email')}</Text>
              <Text style={styles.detailsText}>{userData?.email}</Text>
            </View>
          </View>
        )}

        <View style={styles.dataContainer}>
          <Image
            source={require('../../assets/phone.png')}
            style={styles.iconPhone}
            accessibilityHint="phone-image"
          />
          <View style={styles.details}>
            <Text style={styles.headerText}>{t('Phone Number')}</Text>
            <Text style={styles.detailsText}>{userData?.phoneNumber}</Text>
          </View>
        </View>
      </View>
      <ProfileMoreOptionsModal visible={modalVisible} onClose={onClose} />
    </View>
  );
};
