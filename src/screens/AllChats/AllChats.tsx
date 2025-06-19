import {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import EncryptedStorage from 'react-native-encrypted-storage';
import {messageDecryption} from '../../services/MessageDecryption';
import {useDeviceCheck} from '../../services/useDeviceCheck';
import {ChatBox} from '../../components/ChatBox/ChatBox';
import {PlusIcon} from '../../components/PlusIcon/PlusIcon';
import {hide} from '../../store/slices/loadingSlice';
import {setUnreadCount} from '../../store/slices/unreadChatSlice';
import {RootState} from '../../store/store';
import {HomeStackProps, NavigationProps} from '../../types/usenavigation.type';
import {useThemeColors} from '../../themes/colors';
import {getStyles} from './AllChats.styles';
import {Home} from '../Home/Home';
import {User} from '../Profile/Profile';
import {
  getAllChatsFromLocal,
  getTotalUnreadCount,
  LocalChat,
} from '../../database/services/chatOperations';
import {getDBInstance} from '../../database/connection/connection';
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

export const AllChats = () => {
  const navigation = useNavigation<NavigationProps>();
  const homeStackNavigation = useNavigation<HomeStackProps>();
  const dispatch = useDispatch();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const [currentUserPhoneNumber, setCurrentUserPhoneNumber] =
    useState<string>('');
  const [chats, setChats] = useState<LocalChat[]>([]);
  const {msgCount} = useSelector((state: RootState) => state.unread);
  const [updateStatusCount, setUpdateStatusCount] = useState(0);
  const chatTrigger = useSelector((state: RootState) => state.chat);

  useDeviceCheck();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'QuickChat',
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTitleStyle: {
        color: colors.text,
      },
    });
  });

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
        const db = await getDBInstance();
        const currentUser = await EncryptedStorage.getItem('user');
        // if (!currentUser) {
        //   return;
        // }

        const parsed = JSON.parse(currentUser!);
        const chatsOfUser = await getAllChatsFromLocal(db, parsed.phoneNumber);
        const privateKey = await EncryptedStorage.getItem('privateKey');
        if (privateKey) {
          for (const chat of chatsOfUser) {
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
        }
        setChats(chatsOfUser);

        const totalUnread = await getTotalUnreadCount(db);
        dispatch(setUnreadCount(totalUnread));
      };
      fetchChats();
      if (msgCount >= 0 || updateStatusCount >= 0 || chatTrigger) {
        fetchChats();
      }
    }, [msgCount, updateStatusCount, chatTrigger, dispatch]),
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
                  name: chat.contactName,
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
              name={chat.contactName}
              description={chat.lastMessageText}
              timestamp={chat.lastMessageTimestamp}
              unreadCount={chat.unreadCount}
              status={
                chat.lastMessageType === 'sentMessage'
                  ? chat.lastMessageStatus
                  : undefined
              }
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
