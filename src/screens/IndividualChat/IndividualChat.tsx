import {useEffect, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import io from 'socket.io-client';

import {IndividualChatHeader} from '../../components/IndividualChatHeader/IndividualChatHeader';
import {MessageInput} from '../../components/MessageInput/MessageInput';
import {useThemeColors} from '../../themes/colors';
import {HomeStackParamList} from '../../types/usenavigation.type';
import {individualChatstyles} from './IndividualChat.styles';

type Props = NativeStackScreenProps<HomeStackParamList, 'individualChat'>;
export const IndividualChat = ({route}: Props) => {
  const [message, setMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  const [sendMessages, setSendMessages] = useState<any[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const currentUserId = 1223;
  const recipientId = 1222;
  useEffect(() => {
    const newSocket = io('http://localhost:5050');
    setSocket(newSocket);
    newSocket.emit('join', {userId: currentUserId});

    newSocket.on(`receive_private_message_${recipientId}`, data => {
      setReceivedMessages(prev => [...prev, data]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);
  if (message) {
    const sendMessage = () => {
      if (socket && message.trim() !== '') {
        const timestamp = new Date().toISOString();

        const payload = {
          toUserId: recipientId,
          fromUserId: currentUserId,
          message: message,
          timestamp,
        };

        socket.emit('send_private_message', payload);

        setSendMessages(prev => [...prev, payload]);
        setMessage('');
      }
    };
    sendMessage();
  }
  const allMessages = [...receivedMessages, ...sendMessages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  const user = route.params.user;
  const colors = useThemeColors();
  const styles = individualChatstyles(colors);
  return (
    <View style={styles.container}>
      <View>
        <IndividualChatHeader
          name={user.name}
          profilePicture={user.profilePicture}
        />
      </View>
      <ScrollView style={styles.chatContainer}>
        {allMessages.map((msg, index) => {
          const isSent = msg.fromUserId === currentUserId;
          return (
            <View
              key={index}
              style={[
                styles.messageBlock,
                isSent ? styles.sentMessage : styles.receivedMessage,
              ]}>
              <Text style={styles.messageText}>{msg.message}</Text>
              <Text style={styles.timestamp}>
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.InputContainer}>
        <MessageInput setMessage={setMessage} />
      </View>
    </View>
  );
};
