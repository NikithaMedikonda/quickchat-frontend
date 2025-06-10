import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useCallback, useLayoutEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useDispatch, useSelector} from 'react-redux';
import {ChatBox} from '../../components/ChatBox/ChatBox';
import {numberNameIndex} from '../../helpers/nameNumberIndex';
import {normalise} from '../../helpers/normalisePhoneNumber';
import {getAllChats} from '../../services/GetAllChats';
import {messageDecryption} from '../../services/MessageDecryption';
import {hide} from '../../store/slices/loadingSlice';
import {logout} from '../../store/slices/loginSlice';
import {
  setAlertMessage,
  setAlertTitle,
  setAlertType,
  setAlertVisible,
} from '../../store/slices/registrationSlice';
import {setUnreadCount} from '../../store/slices/unreadChatSlice';
import {RootState} from '../../store/store';
import {useThemeColors} from '../../themes/colors';
import {
  NavigationProps,
  UnreadStacKProps,
} from '../../types/usenavigation.type';
import {getStyles} from './UnreadChats.style';
export interface Chat {
  chatId: string;
  contactName: string | null;
  contactProfilePic: string | null;
  lastMessageStatus: 'sent' | 'delivered' | 'read';
  lastMessageText: string;
  lastMessageTimestamp: string;
  lastMessageType: 'sentMessage' | 'receivedMessage';
  phoneNumber: string;
  unreadCount: number;
  publicKey: string;
}

type ContactNameMap = Record<string, string>;

export const UnreadChats = () => {
  const {t} = useTranslation('home');
  const navigation = useNavigation<NavigationProps>();
  const unreadStackNavigation = useNavigation<UnreadStacKProps>();
  const dispatch = useDispatch();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const [chats, setChats] = useState<Chat[]>([]);
  const [contactNameMap, setContactNameMap] = useState<ContactNameMap>({});
  const {msgCount} = useSelector((state: RootState) => state.unread);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t('Quick Chat'),
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTitleStyle: {
        color: colors.text,
      },
    });
  });

  const showAlert = useCallback(
    (type: string, title: string, message: string) => {
      dispatch(setAlertType(type));
      dispatch(setAlertTitle(title));
      dispatch(setAlertMessage(message));
      dispatch(setAlertVisible(true));
    },
    [dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      const fetchChats = async () => {
        const phoneNameMap = await numberNameIndex();
        if (phoneNameMap === null) {
          dispatch(logout());
          showAlert('error', 'Session Expired', 'Please login again.');
          await EncryptedStorage.clear();
          setTimeout(() => {
            dispatch(setAlertVisible(false));
            navigation.replace('login');
          }, 1000);
          return;
        }

        setContactNameMap(phoneNameMap as ContactNameMap);
        const response = await getAllChats();

        if (response.status === 401 || response.data === null) {
          dispatch(logout());
          showAlert('error', 'Session Expired', 'Please login again.');
          await EncryptedStorage.clear();
          setTimeout(() => {
            dispatch(setAlertVisible(false));
            navigation.replace('login');
          }, 1000);
        } else if (response.status === 200 && response.data) {
          const privateKey = await EncryptedStorage.getItem('privateKey');
          if (privateKey) {
            for (const chat of response.data.chats) {
              try {
                const decryptedMessage = await messageDecryption({
                  encryptedMessage: chat.lastMessageText,
                  myPrivateKey: privateKey,
                  senderPublicKey: chat.publicKey,
                });
                chat.lastMessageText = decryptedMessage;
              } catch (error) {
                dispatch(hide());
              }
            }

            const allChats = response.data.chats;
            const unreadChats = allChats.filter(
              (chat: {unreadCount: number}) => chat.unreadCount > 0,
            );

            const totalUnreadChats = unreadChats.length;
            dispatch(setUnreadCount(totalUnreadChats));

            setChats(unreadChats);
          }
        } else {
          showAlert('info', 'Unable to Fetch Chats', 'Please try again later.');
        }
      };
      if (msgCount >= 0) {
        fetchChats();
      }
    }, [dispatch, msgCount, navigation, showAlert]),
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatsContainer}>
        {chats.length === 0 ? (
          <View style={styles.noMessagesContainer}>
            <Text style={styles.unReadText}>{t('EmptyUnreadMessage')}</Text>
          </View>
        ) : (
          chats.map(chat => (
            <TouchableOpacity
              key={chat.chatId}
              onPress={() =>
                unreadStackNavigation.navigate('individualChat', {
                  user: {
                    name:
                      contactNameMap[normalise(chat.phoneNumber)] ||
                      chat.phoneNumber,
                    profilePicture: chat.contactProfilePic,
                    phoneNumber: chat.phoneNumber,
                    isBlocked: false,
                    publicKey: chat.publicKey,
                    onBlockStatusChange: () => {},
                  },
                })
              }>
              <ChatBox
                image={chat.contactProfilePic}
                name={
                  contactNameMap[normalise(chat.phoneNumber)] ||
                  chat.phoneNumber
                }
                description={chat.lastMessageText}
                timestamp={chat.lastMessageTimestamp}
                unreadCount={chat.unreadCount}
                status={chat.lastMessageStatus}
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};
