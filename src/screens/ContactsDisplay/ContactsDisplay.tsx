import {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {
  setAlertTitle,
  setAlertType,
  setAlertMessage,
  setAlertVisible,
} from '../../store/slices/registrationSlice';
import Contacts from 'react-native-contacts';
import {useDispatch, useSelector} from 'react-redux';
import {Contact} from '../../components/Contact/Contact';
import {DEFAULT_PROFILE_IMAGE} from '../../constants/defaultImage';
import {getContacts} from '../../services/GetContacts';
import {useThemeColors} from '../../themes/colors';
import {ContactDetails} from '../../types/contact.types';
import {HomeStackProps, HomeTabsProps} from '../../types/usenavigation.type';
import {getStyles} from './ContactsDisplay.styles';
import {hide} from '../../store/slices/loadingSlice';
import {RootState} from '../../store/store';
import {CustomAlert} from '../../components/CustomAlert/CustomAlert';

const LeftHeader = ({onPress}: {onPress: () => void}) => {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.loadingContactsText}>く</Text>
      </TouchableOpacity>
    </View>
  );
};

export const ContactsDisplay = () => {
  const [appContacts, setAppContacts] = useState<ContactDetails[] | []>([]);
  const [phoneContacts, setPhoneContacts] = useState<ContactDetails[] | []>([]);
  const [loading, setLoading] = useState<Boolean>(true);
  const dispatch = useDispatch();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const navigation = useNavigation<HomeTabsProps>();
  const {t} = useTranslation('contact');
  const {alertType, alertTitle, alertMessage} = useSelector(
    (state: RootState) => state.registration,
  );
  const homeStackNavigation = useNavigation<HomeStackProps>();

  const showAlert = useCallback((type: string, title: string, message: string) => {
    dispatch(setAlertType(type));
    dispatch(setAlertTitle(title));
    dispatch(setAlertMessage(message));
    dispatch(setAlertVisible(true));
  },
  [dispatch],
);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const renderHeaderLeft = useCallback(() => {
    return <LeftHeader onPress={handleGoBack} />;
  }, [handleGoBack]);

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
        showAlert('info', 'Unable fetch contacts', 'Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [dispatch, showAlert, t]);

  return (
    <View style={styles.contactsContainer}>
      <ScrollView contentContainerStyle={styles.scroll}>
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
      <CustomAlert type={alertType} title={alertTitle} message={alertMessage} />
    </View>
  );
};
