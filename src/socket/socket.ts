import io from 'socket.io-client';
import { API_URL } from '../constants/api';
import { SentPrivateMessage } from '../types/messsage.types';
export const newSocket = io(`${API_URL}`);
export async function socketConnection(userPhoneNumber: string) {
  newSocket.emit('join', userPhoneNumber);
}
export async function receivePrivateMessage(
  senderPhoneNumber: string,
  callback: (message: SentPrivateMessage) => void,
) {
  await newSocket.on(`receive_private_message_${senderPhoneNumber}`, callback);
}
export async function receiveOnline({
  withChattingNumber,
  setIsOnline,
}: {
  withChattingNumber: string;
  setIsOnline: (isOnline: boolean) => void;
}) {
  await newSocket.on(`isOnline_with_${withChattingNumber}`, (data: any) => {
    setIsOnline(data.isOnline);
  });
}
export async function receiveOffline({
  withChattingNumber,
  setIsOnline,
}: {
  withChattingNumber: string;
  setIsOnline: (message: boolean) => void;
}) {
  await newSocket.on(`offline_with_${withChattingNumber}`, (data: any) => {
    setIsOnline(data.online);
  });
}
export async function sendPrivateMessage(payload: SentPrivateMessage) {
  newSocket.emit('send_private_message', {
    recipientPhoneNumber: payload.recipientPhoneNumber,
    message: payload.message,
    senderPhoneNumber: payload.senderPhoneNumber,
    timestamp: payload.timestamp,
  });
}
export async function receiveJoined({
  userPhoneNumber,
  setSocketId,
}: {
  userPhoneNumber: string;
  setSocketId: (si: string) => void;
}) {
  await newSocket.on('I-joined', (data: any) => {
    console.log('In I joined', data.phoneNumber);
    if (data.phoneNumber === userPhoneNumber) {
      setSocketId(data.socketId);
    }
  });
}
