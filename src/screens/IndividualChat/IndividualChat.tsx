import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, Text, View} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useDispatch, useSelector} from 'react-redux';
import {Socket} from 'socket.io-client';
import {CustomAlert} from '../../components/CustomAlert/CustomAlert';
import {IndividualChatHeader} from '../../components/IndividualChatHeader/IndividualChatHeader';
import {MessageInput} from '../../components/MessageInput/MessageInput';
import {MessageStatusTicks} from '../../components/MessageStatusTicks/MessageStatusTicks';
import {TimeStamp} from '../../components/TimeStamp/TimeStamp';
import {insertToMessages} from '../../database/services/messageOperations';
import {
  deleteFromQueue,
  getQueuedMessages,
  insertToQueue,
  updateLocalMessageStatus,
} from '../../database/services/queueOperations';
import {checkBlockedStatusLocal} from '../../database/services/userRestriction';
import {MessageType} from '../../database/types/message';
import {useSocketConnection} from '../../hooks/useSocketConnection';
import {checkBlockStatus} from '../../services/CheckBlockStatus';
import {CheckUserDeleteStatus} from '../../services/CheckUserDeleteStatus';
import {checkUserOnline} from '../../services/CheckUserOnline';
import {getMessagesBetween} from '../../services/GetMessagesBetween';
import {messageDecryption} from '../../services/MessageDecryption';
import {messageEncryption} from '../../services/MessageEncryption';
import {updateMessageStatus} from '../../services/UpdateMessageStatus';
import {useDeviceCheck} from '../../services/useDeviceCheck';
import {
  newSocket,
  receiveJoined,
  receiveOffline,
  receiveOnline,
  receivePrivateMessage,
  sendPrivateMessage,
  socketConnection,
} from '../../socket/socket';
import {hide} from '../../store/slices/loadingSlice';
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
  PendingMessages,
  ReceivePrivateMessage,
  SentPrivateMessage,
} from '../../types/messsage.types';
import {HomeStackParamList} from '../../types/usenavigation.type';
import {createChatId} from '../../utils/chatId';
import {generateMessageId} from '../../utils/messageId';
import {User} from '../Profile/Profile';
import {individualChatStyles} from './IndividualChat.styles';

type Props = NativeStackScreenProps<HomeStackParamList, 'individualChat'>;

export const IndividualChat = ({route}: Props) => {
  useDeviceCheck();
  const {t} = useTranslation('individualChat');
  const [message, setMessage] = useState('');
  const [isOnlineWith, setIsOnlineWith] = useState<boolean>(false);
  const dispatch = useDispatch();
  const {alertType, alertTitle, alertMessage} = useSelector(
    (state: RootState) => state.registration,
  );

  const [isBlocked, setIsUserBlocked] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [receivedMessages, setReceivedMessages] = useState<
    ReceivePrivateMessage[]
  >([]);
  const [sendMessages, setSendMessages] = useState<SentPrivateMessage[]>([]);
  const [pendingMessages, setPendingMessages] = useState<PendingMessages[]>([]);
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
  const [isCleared, setIsCleared] = useState(false);
  const {isConnected} = useSocketConnection();

  const [socketId, setSocketId] = useState<string | null>(null);
  const scrollToBottom = async () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd();
    }
  };

  const handleBlockStatusChange = (newBlockStatus: boolean) => {
    setIsUserBlocked(newBlockStatus);
  };

  const showAlert = useCallback(
    (type: string, title: string, messages: string) => {
      dispatch(setAlertType(type));
      dispatch(setAlertTitle(title));
      dispatch(setAlertMessage(messages));
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
          if (isConnected) {
            const response = await checkBlockStatus({
              blockerPhoneNumber: userData.phoneNumber,
              blockedPhoneNumber: user.phoneNumber,
              authToken: token,
            });
            if (response.status === 200) {
              setIsUserBlocked(response.data.isBlocked);
            }
          } else {
            const result = await checkBlockedStatusLocal(
              userData.phoneNumber,
              user.phoneNumber,
            );
            setIsUserBlocked(result);
          }
        }
      } catch (error) {
        showAlert('info', 'Network Error', 'Unable to fetch details');
      }
    };

    getBlockStatus();
  }, [showAlert, user.phoneNumber, isConnected]);

  useEffect(() => {
    const getUserDeleteStatus = async () => {
      try {
        const token = await EncryptedStorage.getItem('authToken');
        if (!token) {
          showAlert('info', 'Network Error', 'Unable to get user details');
          return;
        }
        const result = await CheckUserDeleteStatus({
          phoneNumber: user.phoneNumber,
          authToken: token,
        });
        if (result.status === 200) {
          setIsDeleted(result.data.isDeleted);
        }
      } catch (error) {
        showAlert('info', 'Network Error', 'Unable to fetch details');
      }
    };

    getUserDeleteStatus();
  }, [showAlert, user.phoneNumber]);

  useEffect(() => {
    setSocket(newSocket);
    const withChattingPhoneNumber = user.phoneNumber;
    if (!isBlocked && currentUserPhoneNumberRef.current !== user.phoneNumber) {
      newSocket.emit('online_with', withChattingPhoneNumber);
    }
    async function checkJoined() {
      receiveJoined({
        userPhoneNumber: user.phoneNumber,
        setSocketId: setSocketId,
      });
    }
    checkJoined();
  }, [user.phoneNumber, isBlocked]);
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
      try {
        if (isCleared) {
          setAllMessages([]);
          return;
        }
        const authToken = await EncryptedStorage.getItem('authToken');

        if (authToken) {
          const userStatus = await checkUserOnline({
            phoneNumber: user.phoneNumber,
            authToken: authToken,
            requestedUserPhoneNumber: currentUserPhoneNumberRef.current,
          });
          if (userStatus.status === 200) {
            setSocketId(userStatus.data.data.socketId);
          }
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
          const data = await Messages.data;

          const privateKey = await EncryptedStorage.getItem('privateKey');
          const formattedMessages = [];
          if (privateKey) {
            for (const msg of data.chats) {
              try {
                const decryptedMessage = await messageDecryption({
                  encryptedMessage: msg.content,
                  myPrivateKey: privateKey,
                  senderPublicKey: user.publicKey,
                });

                formattedMessages.push({
                  senderPhoneNumber: msg.sender.phoneNumber,
                  recipientPhoneNumber: msg.receiver.phoneNumber,
                  message: decryptedMessage,
                  timestamp: msg.createdAt,
                  status: msg.status,
                });
              } catch (error) {
                dispatch(hide());
              }
            }

            setFetchMessages(formattedMessages);
            setReceivedMessages([]);
            setSendMessages([]);
          }
        }
      } catch (e) {
        setFetchMessages([]);
      }
    }

    getMessages();
  }, [
    isOnlineWith,
    recipientPhoneNumber,
    socketId,
    user.phoneNumber,
    isCleared,
    dispatch,
    user.publicKey,
  ]);
  useEffect(() => {
    async function receiveMessage() {
      const handleNewMessage = async (data: SentPrivateMessage) => {
        const privateKey = await EncryptedStorage.getItem('privateKey');
        let decryptedMessage: string;
        if (privateKey) {
          decryptedMessage = await messageDecryption({
            encryptedMessage: data.message,
            myPrivateKey: privateKey,
            senderPublicKey: user.publicKey,
          });
        }
        setReceivedMessages(prev => [
          ...prev,
          {...data, message: decryptedMessage},
        ]);
      };
      await receivePrivateMessage(recipientPhoneNumber, handleNewMessage);
    }
    receiveMessage();
  }, [
    recipientPhoneNumber,
    currentUserPhoneNumberRef,
    user.publicKey,
    dispatch,
    showAlert,
    isCleared,
    user.phoneNumber,
  ]);

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
        previousStatus: 'delivered',
        currentStatus: 'read',
      };
      await updateMessageStatus(details);
    };
    updateStatus();

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
    if (
      !isBlocked &&
      currentUserPhoneNumberRef.current !== recipientPhoneNumber
    ) {
      newSocket.emit('online_with', withChattingPhoneNumber);
    }
    const sendMessage = async () => {
      if (socket) {
        const privateKey = await EncryptedStorage.getItem('privateKey');
        let encryptedMessage = message.trim();
        if (privateKey) {
          encryptedMessage = await messageEncryption({
            message: message.trim(),
            myPrivateKey: privateKey,
            recipientPublicKey: user.publicKey,
          });
        }
        const timestamp = new Date().toISOString();
        let status = 'sent';
        const authToken = await EncryptedStorage.getItem('authToken');
        if (authToken && isConnected) {
          const userStatus = await checkUserOnline({
            phoneNumber: user.phoneNumber,
            authToken: authToken,
            requestedUserPhoneNumber: currentUserPhoneNumberRef.current,
          });
          if (userStatus.status === 200 || userStatus.status === 203) {
            setSocketId(userStatus.data.data.socketId);
          }
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
          message: encryptedMessage,
          timestamp,
          status: status,
        };
        const id = generateMessageId(
          currentUserPhoneNumberRef.current,
          recipientPhoneNumber,
          timestamp,
        );
        if (isConnected) {
          await sendPrivateMessage(payload);
          const localMessage: MessageType = {
            ...payload,
            id: id,
            receiverPhoneNumber: recipientPhoneNumber,
          };
          await insertToMessages(localMessage);
          setSendMessages(prev => [
            ...prev,
            {...payload, message: message.trim()},
          ]);
        } else {
          payload.status = 'pending';
          const localMessage: MessageType = {
            ...payload,
            id: id,
            receiverPhoneNumber: recipientPhoneNumber,
          };
          await insertToQueue(localMessage);
          await insertToMessages(localMessage);
          setPendingMessages(prev => [
            ...prev,
            {...payload, message: message.trim()},
          ]);
        }

        setMessage('');
      }
    };

    if (message) {
      async function selfChat() {
        const privateKey = await EncryptedStorage.getItem('privateKey');
        let encryptedMessage = message.trim();
        if (privateKey) {
          encryptedMessage = await messageEncryption({
            message: message.trim(),
            myPrivateKey: privateKey,
            recipientPublicKey: user.publicKey,
          });
        }
        const timestamp = new Date().toISOString();
        const payload: SentPrivateMessage = {
          recipientPhoneNumber,
          senderPhoneNumber: currentUserPhoneNumberRef.current,
          message: encryptedMessage,
          timestamp,
          status: 'read',
        };
        const id = generateMessageId(
          currentUserPhoneNumberRef.current,
          recipientPhoneNumber,
          timestamp,
        );
        const localMessage: MessageType = {
          ...payload,
          id: id,
          receiverPhoneNumber: recipientPhoneNumber,
        };
        setSendMessages(prev => [
          ...prev,
          {...payload, message: message.trim()},
        ]);
        if (isConnected) {
          await sendPrivateMessage(payload);
          await insertToMessages(localMessage);
        } else {
          await insertToQueue({...localMessage, status: 'pending'});
          await insertToMessages(localMessage);
        }
      }
      if (currentUserPhoneNumberRef.current === recipientPhoneNumber) {
        selfChat();
      } else {
        sendMessage();
      }
    }
  }, [
    isOnlineWith,
    message,
    recipientPhoneNumber,
    socket,
    socketId,
    user.phoneNumber,
    user.publicKey,
    isBlocked,
    isConnected,
  ]);

  const processQueueMessages = useCallback(async () => {
    const currentUser = await EncryptedStorage.getItem('user');
    if (currentUser) {
      const parsedUser: User = JSON.parse(currentUser);
      currentUserPhoneNumberRef.current = parsedUser.phoneNumber;
    }
    const userData = {
      senderPhoneNumber: currentUserPhoneNumberRef.current,
      receiverPhoneNumber: recipientPhoneNumber,
    };
    const chatId = createChatId(
      userData.receiverPhoneNumber,
      userData.senderPhoneNumber,
    );
    const authToken = await EncryptedStorage.getItem('authToken');

    if (authToken) {
      const userStatus = await checkUserOnline({
        phoneNumber: user.phoneNumber,
        authToken: authToken,
        requestedUserPhoneNumber: currentUserPhoneNumberRef.current,
      });
      if (userStatus.status === 200) {
        setSocketId(userStatus.data.data.socketId);
      }
    }
    async function checkOffline() {
      if (currentUser) {
        await receiveOffline({
          withChattingNumber: currentUserPhoneNumberRef.current,
          setIsOnline: setIsOnlineWith,
        });
      }
    }
    await checkOffline();

    async function checkOnline() {
      if (currentUser) {
        await receiveOnline({
          withChattingNumber: currentUserPhoneNumberRef.current,
          setIsOnline: setIsOnlineWith,
        });
      }
    }
    await checkOnline();

    let status: string;
    if (socketId && !isOnlineWith) {
      status = 'delivered';
    } else if (socketId && isOnlineWith) {
      status = 'read';
    } else {
      status = 'sent';
    }

    const messages = await getQueuedMessages(chatId);

    const resultantMessages = messages.map((queuedMessage: MessageType) => ({
      ...queuedMessage,
      recipientPhoneNumber: queuedMessage.receiverPhoneNumber,
    }));
    const privateKey = await EncryptedStorage.getItem('privateKey');
    if (currentUserPhoneNumberRef.current !== recipientPhoneNumber) {
      setPendingMessages(resultantMessages);
    }
    for (const queuedMessage of messages) {
      const decryptedMessage = await messageDecryption({
        encryptedMessage: queuedMessage.message,
        myPrivateKey: privateKey!,
        senderPublicKey: user.publicKey,
      });
      const payload: SentPrivateMessage = {
        recipientPhoneNumber: queuedMessage.receiverPhoneNumber,
        message: queuedMessage.message,
        senderPhoneNumber: queuedMessage.senderPhoneNumber,
        timestamp: queuedMessage.timestamp,
        status: status,
      };
      await sendPrivateMessage(payload);

      if (currentUserPhoneNumberRef.current !== recipientPhoneNumber) {
        setPendingMessages(prev =>
          prev.filter(msg => msg.id !== queuedMessage.id),
        );
        setSendMessages(prev => [
          ...prev,
          {...payload, message: decryptedMessage},
        ]);
        queuedMessage.status = status;
        await updateLocalMessageStatus(queuedMessage);
      }

      await deleteFromQueue(queuedMessage.id);
    }
  }, [
    isOnlineWith,
    recipientPhoneNumber,
    socketId,
    user.phoneNumber,
    user.publicKey,
  ]);

  useEffect(() => {
    if (isConnected) {
      async function connect() {
        const anotherUser = await EncryptedStorage.getItem('user');
        if (anotherUser) {
          const parsedUser: User = JSON.parse(anotherUser);
          if (parsedUser.phoneNumber !== recipientPhoneNumber) {
            await socketConnection(parsedUser.phoneNumber);
          }
        }
      }
      connect();
      const withChattingPhoneNumber = user.phoneNumber;
      if (
        !isBlocked &&
        currentUserPhoneNumberRef.current !== recipientPhoneNumber
      ) {
        newSocket.emit('online_with', withChattingPhoneNumber);
      }
      processQueueMessages();
    }
  }, [
    isBlocked,
    isConnected,
    processQueueMessages,
    user.phoneNumber,
    recipientPhoneNumber,
  ]);
  useEffect(() => {
    const all = [
      ...fetchMessages,
      ...sendMessages,
      ...receivedMessages,
      ...pendingMessages,
    ];
    const Messages = all.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    setAllMessages(Messages);
  }, [receivedMessages, sendMessages, fetchMessages, pendingMessages]);

  return (
    <View style={styles.container}>
      <View style={styles.chatHeaderContainer}>
        <IndividualChatHeader
          name={user.name}
          profilePicture={user.profilePicture}
          phoneNumber={user.phoneNumber}
          publicKey={user.publicKey}
          isBlocked={isBlocked}
          onBlockStatusChange={handleBlockStatusChange}
          setIsCleared={setIsCleared}
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
                  {t('Ready to chat? Start typing and hit send! 🤗')}
                </Text>
              </View>
            )}
          </ScrollView>
          {isDeleted ? (
            <View style={styles.ShowErrorContainer}>
              <Text style={styles.errorText}>
                {t("This user doesn't exist on QuickChat anymore 🙃")}
              </Text>
            </View>
          ) : isBlocked ? (
            <View style={styles.ShowErrorContainer}>
              <Text style={styles.errorText}>
                {t(
                  'This user is currently blocked. Unblock them to send messages. 🙂',
                )}
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
