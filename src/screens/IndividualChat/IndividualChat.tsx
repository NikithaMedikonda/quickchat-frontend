import {useEffect, useRef, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import EncryptedStorage from 'react-native-encrypted-storage';
import {IndividualChatHeader} from '../../components/IndividualChatHeader/IndividualChatHeader';
import {MessageInput} from '../../components/MessageInput/MessageInput';
import {MessageStatusTicks} from '../../components/MessageStatusTicks/MessageStatusTicks';
import {TimeStamp} from '../../components/TimeStamp/TimeStamp';

import {Socket} from 'socket.io-client';
import {getMessagesBetween} from '../../services/GetMessagesBetween';
import {updateMessageStatus} from '../../services/UpdateMessageStatus';
import {
  newSocket,
  receivePrivateMessage,
  sendPrivateMessage,
} from '../../socket/socket';
import {useThemeColors} from '../../themes/colors';
import {
  AllMessages,
  Chats,
  ReceivePrivateMessage,
  SentPrivateMessage,
} from '../../types/messsage.types';
import {HomeStackParamList} from '../../types/usenavigation.type';
import {User} from '../Profile/Profile';
import {checkBlockStatus} from '../../services/CheckBlockStatus';
import {individualChatStyles} from './IndividualChat.styles';

type Props = NativeStackScreenProps<HomeStackParamList, 'individualChat'>;

export const IndividualChat = ({route}: Props) => {
  const [message, setMessage] = useState('');
  const [isUserBlocked, setIsUserBlocked] = useState(false);
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
  const scrollToBottom = async () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: true});
    }
  };
useEffect(() => {
  const getBlockStatus = async () => {
    try {
      const currentUser = await EncryptedStorage.getItem('user');
      const token = await EncryptedStorage.getItem('authToken');
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
      console.error(error)
    }
  };

  getBlockStatus();
}, [user.phoneNumber]);

  useEffect(() => {
    setSocket(newSocket);
    async function getMessages() {
      const currentUser = await EncryptedStorage.getItem('user');
      if (currentUser) {
        const parsedUser: User = JSON.parse(currentUser);
        currentUserPhoneNumberRef.current = parsedUser.phoneNumber;
      }
      const userData = {
        senderPhoneNumber: currentUserPhoneNumberRef.current,
        receiverPhoneNumber: recipientPhoneNumber,
      };
      const messages = await getMessagesBetween(userData);
      if (messages.status === 200) {
        const data = messages.data;
        const formattedMessages = data.chats.map((msg: Chats) => ({
          senderPhoneNumber: msg.sender.phoneNumber,
          recipientPhoneNumber: msg.receiver.phoneNumber,
          message: msg.content,
          timestamp: msg.createdAt,
          status: msg.status,
        }));
        setFetchMessages(formattedMessages);
      }
    }

    getMessages();



    async function receiveMessage() {
      const handleNewMessage = (data: SentPrivateMessage) => {
        setReceivedMessages(prev => [...prev, data]);
      };
      const data = await receivePrivateMessage(
        recipientPhoneNumber,
        handleNewMessage,
      );
      if (data.message !== '') {
        setReceivedMessages(prev => [...prev, data]);
      }
    }
    receiveMessage();
  }, [recipientPhoneNumber, currentUserPhoneNumberRef]);

  useEffect(() => {
    const sendMessage = async () => {
      if (socket && message.trim() !== '') {
        const timestamp = new Date().toISOString();
        const payload: SentPrivateMessage = {
          recipientPhoneNumber,
          senderPhoneNumber: currentUserPhoneNumberRef.current,
          message: message.trim(),
          timestamp,
          status: 'sent',
        };
        await sendPrivateMessage(payload);
        setSendMessages(prev => [...prev, payload]);
        setMessage('');
      }
    };

    if (message) {
      sendMessage();
    }
    const updateStatus = async () => {
      const details = {
        senderPhoneNumber: currentUserPhoneNumberRef.current,
        receiverPhoneNumber: recipientPhoneNumber,
        timestamp: Date.now().toLocaleString(),
        previousStatus: 'delivered',
        currentStatus: 'read',
      };
      await updateMessageStatus(details);
    };
    updateStatus();
  }, [message, recipientPhoneNumber, socket]);

  useEffect(() => {
    const all = [...fetchMessages, ...sendMessages, ...receivedMessages];
    const Messages = all.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    setAllMessages(Messages);
  }, [receivedMessages, sendMessages, fetchMessages]);

  return (
    <View style={styles.container}>
      <View style={styles.chatHeaderContainer} >
        <IndividualChatHeader
          name={user.name}
          profilePicture={user.profilePicture}
          phoneNumber={user.phoneNumber}
          isBlocked={isUserBlocked}
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
          <View style={styles.InputContainer}>
            <MessageInput setMessage={setMessage} />
          </View>
        </View>
      </View>
    </View>
  );
};
