import {
  useEffect,
  useLayoutEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import {View, Image, Text, TouchableOpacity, ScrollView} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {getStyles} from './Profile.styles';
import {ProfileMoreOptionsModal} from '../../components/ProfileMoreOptionsModal/ProfileMoreOptionsModal';
import {useThemeColors} from '../../themes/colors';
import {useImagesColors} from '../../themes/images';
import {DEFAULT_PROFILE_IMAGE} from '../../constants/defaultImage';

export interface User {
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  email: string;
  phoneNumber: string;
  isDeleted: boolean;
}
const ProfileHeaderRight = ({onPress}: {onPress: () => void}) => {
  const {profileDots} = useImagesColors();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.headerRight}>
      <TouchableOpacity onPress={onPress}>
        <Image
          source={profileDots}
          accessibilityHint="dots-image"
          style={styles.profileDots}
        />
      </TouchableOpacity>
    </View>
  );
};

export const Profile = () => {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const {t} = useTranslation('auth');
  const [userData, setUserData] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const handleMoreOptionsModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const onClose = useCallback(() => {
    setModalVisible(false);
  }, []);

  const headerRightComponent = useMemo(
    () => <ProfileHeaderRight onPress={handleMoreOptionsModal} />,
    [handleMoreOptionsModal],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitleAlign: 'center',
      headerRight: () => headerRightComponent,
    });
  }, [navigation, headerRightComponent]);

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
    <ScrollView>
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.profileImageContainer}>
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
                uri: DEFAULT_PROFILE_IMAGE,
              }}
              accessibilityHint="profile-image"
              style={styles.profileImage}
            />
          )}
        </View>
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
    </ScrollView>
  );
};
