import {useEffect, useLayoutEffect, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {
  ALERT_TYPE,
  AlertNotificationRoot,
  Dialog,
} from 'react-native-alert-notification';
import Contacts from 'react-native-contacts';
import {useDispatch} from 'react-redux';
import {Contact} from '../../components/Contact/Contact';
import {DEFAULT_PROFILE_IMAGE} from '../../constants/defaultImage';
import {getContacts} from '../../services/GetContacts';
import {useThemeColors} from '../../themes/colors';
import {ContactDetails} from '../../types/contact.types';
import {HomeStackProps, HomeTabsProps} from '../../types/usenavigation.type';
import {getStyles} from './ContactsDisplay.styles';
import {hide} from '../../store/slices/loadingSlice';

export const ContactsDisplay = () => {
  const [appContacts, setAppContacts] = useState<ContactDetails[] | []>([]);
  const [phoneContacts, setPhoneContacts] = useState<ContactDetails[] | []>([]);
  const [loading, setLoading] = useState<Boolean>(true);
  const dispatch = useDispatch();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const navigation = useNavigation<HomeTabsProps>();
  const {t} = useTranslation('contact');
  const homeStackNavigation = useNavigation<HomeStackProps>();
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
      // eslint-disable-next-line react/no-unstable-nested-components
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.loadingContactsText}>く</Text>
        </TouchableOpacity>
      ),
    });
  });

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const allContacts = await getContacts();
        setAppContacts(allContacts.data.registeredUsers);
        const unRegisteredContacts = allContacts.data.unRegisteredUsers;
        const unRegunRegisteredContactDetails: ContactDetails[] = [];
        for (let phoneNumber of unRegisteredContacts) {
          const contactsByPhoneNumber: Contacts.Contact[] =
            await Contacts.getContactsByPhoneNumber(phoneNumber);
          for (let contactByPhoneNumber of contactsByPhoneNumber) {
            unRegunRegisteredContactDetails.push({
              phoneNumber: phoneNumber,
              name: contactByPhoneNumber.givenName || 'unknown',
              profilePicture: DEFAULT_PROFILE_IMAGE,
              toBeInvited: true,
            });
          }
        }
        setPhoneContacts(unRegunRegisteredContactDetails);
      } catch (error: any) {
        dispatch(hide());
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: 'Error occurred while fetching the contacts',
          button: 'close',
          closeOnOverlayTap: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [dispatch, t]);

  return (
    <AlertNotificationRoot
      theme="dark"
      colors={[
        {
          label: '#000000',
          card: '#FFFFFF',
          overlay: 'rgba(0, 0, 0, 0.5)',
          success: '#4CAF50',
          danger: '#F44336',
          warning: '#1877F2',
          info: '#000000',
        },
        {
          label: '#000000',
          card: '#FFFFFF',
          overlay: 'rgba(255, 255, 255, 0.5)',
          success: '#4CAF50',
          danger: '#F44336',
          warning: '#FFFFFF',
          info: '#000000',
        },
      ]}>
      <View style={styles.contactsContainer}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {loading ? (
            <View style={styles.loadingContactsDisplay}>
              <Text style={styles.loadingContactsText}>
                Loading Contacts...
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.title}>{t('Contacts on Quick Chat')}</Text>
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
                          },
                        });
                      }}>
                      <Contact contactDetails={contact} />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.loadingContactsDisplay}>
                  <Text style={styles.loadingContactsText}>
                    {t(
                      "It's so sad that, we have no one on Quick Chat. Share about Quick Chat",
                    )}
                  </Text>
                </View>
              )}
              <Text style={styles.title}>{t('Invite to Quick Chat')}</Text>
              {phoneContacts.length === 0 ? (
                <View style={styles.loadingContactsDisplay}>
                  <Text style={styles.loadingContactsText}>
                    {t(
                      "It's good to see that, all of your contact are onuick Chat.",
                    )}
                  </Text>
                </View>
              ) : (
                <View style={styles.contactDetailsContainer}>
                  {phoneContacts.map(
                    (contact: ContactDetails, index: number) => (
                      <Contact
                        key={`${index}-${contact}`}
                        contactDetails={contact}
                      />
                    ),
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </AlertNotificationRoot>
  );
};
