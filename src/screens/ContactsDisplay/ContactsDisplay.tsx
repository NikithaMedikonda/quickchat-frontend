/* eslint-disable react-native/no-inline-styles */
import {useNavigation} from '@react-navigation/native';
import {useEffect, useLayoutEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Alert, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import Contacts from 'react-native-contacts';

import {Contact} from '../../components/Contact/Contact';
import {DEFAULT_PROFILE_IMAGE} from '../../constants/defaultImage';
import {getContacts} from '../../services/GetContacts';
import {useThemeColors} from '../../themes/colors';
import {ContactDetails} from '../../types/contact.types';
import {HomeStackProps, HomeTabsProps} from '../../types/usenavigation.type';
import {getStyles} from './ContactsDisplay.styles';


export const ContactsDisplay = () => {
  const [appContacts, setAppContacts] = useState<ContactDetails[] | []>([]);
  const [phoneContacts, setPhoneContacts] = useState<ContactDetails[] | []>([]);
  const [loading, setLoading] = useState<Boolean>(true);
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
      } catch (error) {
        Alert.alert(t('Error while fetching the contacts'));
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [t]);

  return (
    <View style={styles.contactsContainer}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        {loading ? (
          <View style={styles.loadingContactsDisplay}>
            <Text style={styles.loadingContactsText}>Loading Contacts...</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.title}>{t('Contacts on Quick Chat')}</Text>
            {appContacts.length > 0 ? (
              <View style={styles.contactDetailsContainer}>
                {appContacts.map((contact: ContactDetails, index: number) => (
                  <TouchableOpacity
                    key={`${contact.name}-${index}`}
                    onPress={() => {
                      homeStackNavigation.navigate('individualChat', {
                        user: {
                          name: contact.name,
                          profilePicture: contact.profilePicture,
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
                {phoneContacts.map((contact: ContactDetails, index: number) => (
                  <Contact
                    key={`${index}-${contact}`}
                    contactDetails={contact}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};
