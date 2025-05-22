import io from 'socket.io-client';
import {SentPrivateMessage} from '../types/messsage.types';
export const newSocket = io('http://192.168.0.2:5050');

export async function socketConnection(userPhoneNumber: string) {
  newSocket.emit('join', userPhoneNumber);
}
export async function receivePrivateMessage(
  senderPhoneNumber: string,
  callback: (message: SentPrivateMessage) => void,
) {
  let result: SentPrivateMessage = {
    recipientPhoneNumber: '',
    message: '',
    senderPhoneNumber: '',
    timestamp: '',
    status: '',
  };
  await newSocket.on(`receive_private_message_${senderPhoneNumber}`, callback);
  return result;
}
export async function sendPrivateMessage(payload: SentPrivateMessage) {
  newSocket.emit('send_private_message', {
    recipientPhoneNumber: payload.recipientPhoneNumber,
    message: payload.message,
    senderPhoneNumber: payload.senderPhoneNumber,
    timestamp: payload.timestamp,
  });
}
