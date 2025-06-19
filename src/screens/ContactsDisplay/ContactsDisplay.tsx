import {useNavigation} from '@react-navigation/native';
import {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Contact} from '../../components/Contact/Contact';
import {DEFAULT_PROFILE_IMAGE} from '../../constants/defaultImage';
import {numberNameIndex} from '../../helpers/nameNumberIndex';
import {normalise} from '../../helpers/normalisePhoneNumber';
import {sortByName} from '../../helpers/sortByName';
import {getContacts} from '../../services/GetContacts';
import {useThemeColors} from '../../themes/colors';
import {useImagesColors} from '../../themes/images';
import {ContactDetails} from '../../types/contact.types';
import {HomeStackProps, HomeTabsProps} from '../../types/usenavigation.type';
import {getStyles} from './ContactsDisplay.styles';
import { useDeviceCheck } from '../../services/useDeviceCheck';

export const BackButton = () => {
  const colors = useThemeColors();
  useDeviceCheck();
  const {androidBackArrow, iOSBackArrow} = useImagesColors();
  const navigation = useNavigation<HomeTabsProps>();
  const styles = getStyles(colors);

  return (
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Image
        source={Platform.OS === 'android' ? androidBackArrow : iOSBackArrow}
        accessibilityHint="back-arrow-image"
        style={styles.backArrow}
      />
    </TouchableOpacity>
  );
};

export const ContactsDisplay = () => {
  const [appContacts, setAppContacts] = useState<ContactDetails[] | []>([]);
  const [phoneContacts, setPhoneContacts] = useState<ContactDetails[] | []>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const homeStackNavigation = useNavigation<HomeStackProps>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const renderHeaderLeft = useCallback(() => <BackButton />, []);

  const navigation = useNavigation<HomeTabsProps>();

  const {t} = useTranslation('contact');
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t('Contacts'),
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTitleStyle: {
        color: colors.text,
      },
      headerLeft: renderHeaderLeft,
    });
  }, [navigation, colors.background, colors.text, t, renderHeaderLeft]);

  const fetchContacts = useCallback(
    async (hardRefresh: boolean) => {
      if (hardRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        const result = await getContacts(hardRefresh);
        const index = await numberNameIndex();
        if (!index) {
          setAppContacts([]);
          setPhoneContacts([]);
          return;
        }
        const registeredUsersDetails: ContactDetails[] =
          result.registeredUsers.map((userDetails: ContactDetails) => ({
            ...userDetails,
            name:
              index[normalise(userDetails.phoneNumber)] ??
              userDetails.phoneNumber,
          }));
        setAppContacts(sortByName(registeredUsersDetails));
        const unRegisteredUserDetails: ContactDetails[] =
          result.unRegisteredUsers.map((phoneNumber: string) => ({
            phoneNumber: phoneNumber,
            name: index[normalise(phoneNumber)] ?? 'unknown',
            profilePicture: DEFAULT_PROFILE_IMAGE,
            toBeInvited: true,
          }));
        setPhoneContacts(sortByName(unRegisteredUserDetails));
      } catch (error) {
        Alert.alert(
          t(`Error while fetching the contacts: ${(error as Error).message}`),
        );
      } finally {
        if (hardRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [t],
  );
  useEffect(() => {
    fetchContacts(false);
  }, [fetchContacts]);

  return (
    <View style={styles.contactsContainer}>
      <ScrollView
        accessibilityHint="refresh-option"
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchContacts(true)}
          />
        }>
        {loading ? (
          <View style={styles.activityContainer}>
            <ActivityIndicator
              accessibilityHint="loader"
              size="large"
              color="white"
            />

          </View>
        ) : (
          <View>
            <Text style={styles.title}>{t('Contacts on QuickChat')}</Text>
            {appContacts.length > 0 ? (
              <View style={styles.contactDetailsContainer}>
                {appContacts.map((contact: ContactDetails, index: number) => (
                  <TouchableOpacity
                    accessibilityHint="contact-label"
                    key={`${contact.name}-${index}`}
                    onPress={() => {
                      homeStackNavigation.navigate('individualChat', {
                        user: {
                          name: contact.name,
                          profilePicture: contact.profilePicture,
                          phoneNumber: contact.phoneNumber,
                          isBlocked: false,
                          publicKey:contact.publicKey,
                          onBlockStatusChange: () => {},
                        },
                      });
                    }}>
                    <Contact key={index} contactDetails={contact} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.loadingContactsDisplay}>
                <Text style={styles.loadingContactsText}>
                  {t(
                    "It's so sad that, we have no one on QuickChat. Share about QuickChat",
                  )}
                </Text>
              </View>
            )}
            <Text style={styles.title}>{t('Invite to QuickChat')}</Text>
            {phoneContacts.length === 0 ? (
              <View style={styles.loadingContactsDisplay}>
                <Text style={styles.loadingContactsText}>
                  {t(
                    "It's good to see that, all of your contacts are on QuickChat.",
                  )}
                </Text>
              </View>
            ) : (
              <View style={styles.contactDetailsContainer}>
                {phoneContacts.map((contact: ContactDetails, index: number) => (
                  <Contact key={index} contactDetails={contact} />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};
