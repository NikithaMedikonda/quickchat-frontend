import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useEffect, useRef, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useDispatch, useSelector} from 'react-redux';
import {Socket} from 'socket.io-client';
import {IndividualChatHeader} from '../../components/IndividualChatHeader/IndividualChatHeader';
import {MessageInput} from '../../components/MessageInput/MessageInput';
import {MessageStatusTicks} from '../../components/MessageStatusTicks/MessageStatusTicks';
import {TimeStamp} from '../../components/TimeStamp/TimeStamp';
import {CustomAlert} from '../../components/CustomAlert/CustomAlert';
import {checkBlockStatus} from '../../services/CheckBlockStatus';
import {checkUserOnline} from '../../services/CheckUserOnline';
import {getMessagesBetween} from '../../services/GetMessagesBetween';
import {updateMessageStatus} from '../../services/UpdateMessageStatus';
import {
  newSocket,
  receiveJoined,
  receiveOffline,
  receiveOnline,
  receivePrivateMessage,
  sendPrivateMessage,
} from '../../socket/socket';
import {
  setAlertMessage,
  setAlertTitle,
  setAlertType,
  setAlertVisible,
  setReceivePhoneNumber,
} from '../../store/slices/registrationSlice';
import {RootState} from '../../store/store';
import {useThemeColors} from '../../themes/colors';
import {
  AllMessages,
  Chats,
  ReceivePrivateMessage,
  SentPrivateMessage,
} from '../../types/messsage.types';
import {HomeStackParamList} from '../../types/usenavigation.type';
import {User} from '../Profile/Profile';
import {individualChatStyles} from './IndividualChat.styles';

type Props = NativeStackScreenProps<HomeStackParamList, 'individualChat'>;

export const IndividualChat = ({route}: Props) => {
  const [message, setMessage] = useState('');
  const [isOnlineWith, setIsOnlineWith] = useState<boolean>(false);
  const dispatch = useDispatch();
  const {alertType, alertTitle, alertMessage} = useSelector(
    (state: RootState) => state.registration,);
  const [isBlocked, setIsUserBlocked] = useState(false);
  const [receivedMessages, setReceivedMessages] = useState<
    ReceivePrivateMessage[]
  >([]);
  const [sendMessages, setSendMessages] = useState<SentPrivateMessage[]>([]);
  const [fetchMessages, setFetchMessages] = useState<ReceivePrivateMessage[]>(
    [],
  );
  const [socket, setSocket] = useState<Socket>();
  const currentUserPhoneNumberRef = useRef<string>('');
  const [allMessages, setAllMessages] = useState<AllMessages[]>([]);
  const user = route.params.user;
  const recipientPhoneNumber = user.phoneNumber;
  const colors = useThemeColors();
  const styles = individualChatStyles(colors);
  const scrollViewRef = useRef<ScrollView>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const scrollToBottom = async () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: true});
    }
  };

  const handleBlockStatusChange = (newBlockStatus: boolean) => {
    setIsUserBlocked(newBlockStatus);
  };

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
    dispatch(setReceivePhoneNumber(user.phoneNumber));
  }, [dispatch, user.phoneNumber]);


  useEffect(() => {
    const getBlockStatus = async () => {
      try {
        const currentUser = await EncryptedStorage.getItem('user');
        const token = await EncryptedStorage.getItem('authToken');
        if (!currentUser || !token) {
          showAlert(
            'info',
            'Network Error',
            'Unable to block or unblock the user',
          );
        }
        if (currentUser && token) {
          const userData = JSON.parse(currentUser);
          const result = await checkBlockStatus({
            blockerPhoneNumber: userData.phoneNumber,
            blockedPhoneNumber: user.phoneNumber,
            authToken: token,
          });
          if (result.status === 200) {
            setIsUserBlocked(result.data.isBlocked);
          }
        }
      } catch (error) {
        showAlert('info', 'Network Error', 'Unable to fetch details');
      }
    };

    getBlockStatus();
  }, [showAlert, user.phoneNumber]);

  useEffect(() => {
    const withChattingPhoneNumber = user.phoneNumber;
    newSocket.emit('online_with', withChattingPhoneNumber);
    setSocket(newSocket);
    async function checkJoined() {
      receiveJoined({
        userPhoneNumber: user.phoneNumber,
        setSocketId: setSocketId,
      });
    }
    checkJoined();
  }, [user.phoneNumber]);
  useEffect(() => {
    async function offline() {
      const updateStatus = async () => {
        const currentUser = await EncryptedStorage.getItem('user');

        if (currentUser) {
          const parsedUser: User = JSON.parse(currentUser);
          currentUserPhoneNumberRef.current = parsedUser.phoneNumber;
        }
        const details = {
          senderPhoneNumber: user.phoneNumber,
          receiverPhoneNumber: currentUserPhoneNumberRef.current,
          timestamp: Date.now(),
          previousStatus: 'delivered',
          currentStatus: 'read',
        };
        await updateMessageStatus(details);
      };
      updateStatus();
      await newSocket.emit('offline_with', user.phoneNumber);
    }
    return () => {
      offline();
    };
  }, [user.phoneNumber]);
  useEffect(() => {
    async function getMessages() {
      const authToken = await EncryptedStorage.getItem('authToken');
      if (authToken) {
        const userStatus = await checkUserOnline({
          phoneNumber: user.phoneNumber,
          authToken: authToken,
        });
        setSocketId(userStatus.data.data.socketId);
      }
      const currentUser = await EncryptedStorage.getItem('user');
      if (currentUser) {
        const parsedUser: User = JSON.parse(currentUser);
        currentUserPhoneNumberRef.current = parsedUser.phoneNumber;
      }
      const userData = {
        senderPhoneNumber: currentUserPhoneNumberRef.current,
        receiverPhoneNumber: recipientPhoneNumber,
      };
      const Messages = await getMessagesBetween(userData);
      if (Messages.status === 200) {
        const data = Messages.data;
        const formattedMessages = data.chats.map((msg: Chats) => ({
          senderPhoneNumber: msg.sender.phoneNumber,
          recipientPhoneNumber: msg.receiver.phoneNumber,
          message: msg.content,
          timestamp: msg.createdAt,
          status: msg.status,
        }));
        setFetchMessages(formattedMessages);
        setSendMessages([]);
        setReceivedMessages([]);
      }
    }

    getMessages();
  }, [isOnlineWith, recipientPhoneNumber, socketId, user.phoneNumber]);
  useEffect(() => {
    setSocket(newSocket);

    async function receiveMessage() {
      const handleNewMessage = (data: SentPrivateMessage) => {
        setReceivedMessages(prev => [...prev, data]);
      };
      await receivePrivateMessage(recipientPhoneNumber, handleNewMessage);
    }
    receiveMessage();
  }, [recipientPhoneNumber, currentUserPhoneNumberRef, user.phoneNumber]);

  useEffect(() => {
    const updateStatus = async () => {
      const currentUser = await EncryptedStorage.getItem('user');

      if (currentUser) {
        const parsedUser: User = JSON.parse(currentUser);
        currentUserPhoneNumberRef.current = parsedUser.phoneNumber;
      }
      const details = {
        senderPhoneNumber: user.phoneNumber,
        receiverPhoneNumber: currentUserPhoneNumberRef.current,
        timestamp: Date.now(),
        previousStatus: 'delivered',
        currentStatus: 'read',
      };
      await updateMessageStatus(details);
    };
    updateStatus();

    async function checkOffline() {
      const currentUser = await EncryptedStorage.getItem('user');

      if (currentUser) {
        const parsedUser: User = JSON.parse(currentUser);
        currentUserPhoneNumberRef.current = parsedUser.phoneNumber;
        await receiveOffline({
          withChattingNumber: currentUserPhoneNumberRef.current,
          setIsOnline: setIsOnlineWith,
        });
      }
    }
    checkOffline();
    async function checkOnline() {
      const currentUser = await EncryptedStorage.getItem('user');

      if (currentUser) {
        const parsedUser: User = JSON.parse(currentUser);
        currentUserPhoneNumberRef.current = parsedUser.phoneNumber;
        await receiveOnline({
          withChattingNumber: currentUserPhoneNumberRef.current,
          setIsOnline: setIsOnlineWith,
        });
      }
    }
    checkOnline();
    const withChattingPhoneNumber = user.phoneNumber;
    newSocket.emit('online_with', withChattingPhoneNumber);
    const sendMessage = async () => {
      if (socket && message.trim() !== '') {
        const timestamp = new Date().toISOString();
        let status = 'sent';
        const authToken = await EncryptedStorage.getItem('authToken');
        if (authToken) {
          const userStatus = await checkUserOnline({
            phoneNumber: user.phoneNumber,
            authToken: authToken,
          });

          setSocketId(userStatus.data.data.socketId);
        }

        if (socketId && !isOnlineWith) {
          status = 'delivered';
        } else if (socketId && isOnlineWith) {
          status = 'read';
        } else {
          status = 'sent';
        }
        const payload: SentPrivateMessage = {
          recipientPhoneNumber,
          senderPhoneNumber: currentUserPhoneNumberRef.current,
          message: message.trim(),
          timestamp,
          status: status,
        };
        await sendPrivateMessage(payload);
        setSendMessages(prev => [...prev, payload]);
        setMessage('');
      }
    };

    if (message) {
      sendMessage();
    }
  }, [
    isOnlineWith,
    message,
    recipientPhoneNumber,
    socket,
    socketId,
    user.phoneNumber,
  ]);

  useEffect(() => {
    // console.log('UseEffect to sort the all');
    const all = [...fetchMessages, ...sendMessages, ...receivedMessages];
    const Messages = all.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    setAllMessages(Messages);
  }, [receivedMessages, sendMessages, fetchMessages]);

  return (
    <View style={styles.container}>
      <View>
        <IndividualChatHeader
          name={user.name}
          profilePicture={user.profilePicture}
          phoneNumber={user.phoneNumber}
          isBlocked={isBlocked}
          onBlockStatusChange={handleBlockStatusChange}
        />
      </View>
      <View style={styles.chatMainContainer}>
        <View style={styles.chatInnerContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatContainer}
            onContentSizeChange={scrollToBottom}>
            {allMessages.length > 0 &&
              allMessages.map((msg: any, index: any) => {
                const isSent =
                  msg.senderPhoneNumber === currentUserPhoneNumberRef.current;

                return (
                  <View
                    key={index}
                    style={[
                      isSent
                        ? styles.sentMessageBlock
                        : styles.receiveMessageBlock,
                      isSent ? styles.sentMessage : styles.receivedMessage,
                    ]}>
                    <Text
                      style={
                        isSent
                          ? styles.sentMessageText
                          : styles.receiveMessageText
                      }>
                      {msg.message}
                    </Text>
                    <View style={styles.timestampContainer}>
                      <TimeStamp messageTime={msg.timestamp} isSent={isSent} />
                      {isSent && <MessageStatusTicks status={msg.status} />}
                    </View>
                  </View>
                );
              })}
            {allMessages.length === 0 && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoMessage}>
                  Ready to chat? Start typing and hit send!
                </Text>
              </View>
            )}
          </ScrollView>
          {isBlocked ? (
            <View style={styles.ShowErrorContainer}>
              <Text style={styles.errorText}>
                This user is currently blocked. Unblock them to send messages.
              </Text>
            </View>
          ) : (
            <View style={styles.InputContainer}>
              <MessageInput setMessage={setMessage} />
            </View>
          )}
        </View>
      </View>
      <CustomAlert type={alertType} title={alertTitle} message={alertMessage} />
    </View>
  );
};
