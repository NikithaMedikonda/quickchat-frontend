import {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import EncryptedStorage from 'react-native-encrypted-storage';
import {getAllChats} from '../../services/GetAllChats';
import {messageDecryption} from '../../services/MessageDecryption';
import {useDeviceCheck} from '../../services/useDeviceCheck';
import {numberNameIndex} from '../../helpers/nameNumberIndex';
import {normalise} from '../../helpers/normalisePhoneNumber';
import {ChatBox} from '../../components/ChatBox/ChatBox';
import {PlusIcon} from '../../components/PlusIcon/PlusIcon';
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
import {HomeStackProps, NavigationProps} from '../../types/usenavigation.type';
import {useThemeColors} from '../../themes/colors';
import {getStyles} from './AllChats.styles';
import {Home} from '../Home/Home';
import {User} from '../Profile/Profile';
import {newSocket} from '../../socket/socket';

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

export const AllChats = () => {
  const navigation = useNavigation<NavigationProps>();
  const homeStackNavigation = useNavigation<HomeStackProps>();
  const dispatch = useDispatch();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const [currentUserPhoneNumber, setCurrentUserPhoneNumber] =
    useState<string>('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [contactNameMap, setContactNameMap] = useState<ContactNameMap>({});
  const {msgCount} = useSelector((state: RootState) => state.unread);
  const [updateStatusCount, setUpdateStatusCount] = useState(0);
  useDeviceCheck();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Quick Chat',
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

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await EncryptedStorage.getItem('user');

      if (currentUser) {
        const parsedUser: User = JSON.parse(currentUser);
        setCurrentUserPhoneNumber(parsedUser.phoneNumber);
      }
    };
    fetchUser();

    const handleUpdateStatus = (data: {isOnline: boolean}) => {
      if (data.isOnline) {
        setUpdateStatusCount(prevCount => prevCount + 1);
      }
    };
    newSocket.on(`isOnline_with_${currentUserPhoneNumber}`, handleUpdateStatus);
  }, [currentUserPhoneNumber, updateStatusCount]);

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
            setChats(response.data.chats);
            const allChats = response.data.chats;
            const unreadChats = allChats.filter(
              (chat: {unreadCount: number}) => chat.unreadCount > 0,
            );

            const totalUnreadChats = unreadChats.length;
            dispatch(setUnreadCount(totalUnreadChats));
          }
        } else {
          showAlert('info', 'Unable to Fetch Chats', 'Please try again later.');
        }
      };
      if (msgCount >= 0 || updateStatusCount >= 0) {
        fetchChats();
      }
    }, [msgCount, updateStatusCount, dispatch, showAlert, navigation]),
  );

  if (chats.length === 0) {
    return <Home />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatsContainer}>
        {chats.map(chat => (
          <TouchableOpacity
            key={chat.chatId}
            onPress={() =>
              homeStackNavigation.navigate('individualChat', {
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
                contactNameMap[normalise(chat.phoneNumber)] || chat.phoneNumber
              }
              description={chat.lastMessageText}
              timestamp={chat.lastMessageTimestamp}
              unreadCount={chat.unreadCount}
              status={chat.lastMessageStatus}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.plusIcon}>
        <PlusIcon />
      </View>
    </View>
  );
};
