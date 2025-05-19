import React, {useEffect, useState} from 'react';
import {Button, StyleSheet, Text, TextInput, View} from 'react-native';
import io from 'socket.io-client';
export function SocketMessage() {
  const [message, setMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState<any>([]);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('message', data => {
      setReceivedMessages((prevMessage:any) =>
        [...prevMessage, data] );
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (socket) {
      socket.emit('message', message);
      setMessage('');
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat App</Text>
      <View style={styles.chatContainer}>
        {receivedMessages.map((msg:any, index:number) => (
          <Text key={index} style={styles.message}>
            {msg}
          </Text>
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Enter message"
        value={message}
        onChangeText={setMessage}
      />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    margin: 10,
  },
  chatContainer: {
    flex: 1,
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
