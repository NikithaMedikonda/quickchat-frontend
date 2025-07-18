import io from 'socket.io-client';
import {API_URL} from '../constants/api';
import {SentPrivateMessage} from '../types/messsage.types';
export const newSocket = io(`${API_URL}`, {
  autoConnect: false,
});
export async function socketConnection(userPhoneNumber: string) {
  if (!newSocket.connected) {
    newSocket.connect();
  }
  newSocket.emit('join', userPhoneNumber);
}
export async function checkDeviceStatus(
  userPhoneNumber: string,
  deviceId: string,
): Promise<{success: boolean; action: string; message: string}> {
  return new Promise((resolve, reject) => {
    const responseHandler = (data: {
      success: boolean;
      action: string;
      message: string;
      registeredDeviceId?: string;
    }) => {
      newSocket.off('user_device_verified', responseHandler);
      resolve(data);
    };

    setTimeout(() => {
      newSocket.off('user_device_verified', responseHandler);
      reject(new Error('Device check timeout'));
    }, 5000);

    newSocket.on('user_device_verified', responseHandler);
    newSocket.emit('check_user_device', userPhoneNumber, deviceId);
  });
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
  await newSocket.on(
    `isOnline_with_${withChattingNumber}`,
    (data: {isOnline: boolean}) => {
      setIsOnline(data.isOnline);
    },
  );
}
export async function receiveOffline({
  withChattingNumber,
  setIsOnline,
}: {
  withChattingNumber: string;
  setIsOnline: (message: boolean) => void;
}) {
  await newSocket.on(
    `offline_with_${withChattingNumber}`,
    (data: {online: boolean}) => {
      setIsOnline(data.online);
    },
  );
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
  await newSocket.on(
    'I-joined',
    (data: {socketId: string; phoneNumber: string}) => {
      if (data.phoneNumber === userPhoneNumber) {
        setSocketId(data.socketId);
      }
    },
  );
}
export async function receiveDeleted({
  userPhoneNumber,
  setSocketId,
}: {
  userPhoneNumber: string;
  setSocketId: (si: null) => void;
}) {
  await newSocket.on(
    'I-deleted',
    (data: {socketId: string; phoneNumber: string}) => {
      if (data.phoneNumber === userPhoneNumber) {
        setSocketId(null);
      }
    },
  );
}
export async function offline({
  phoneNumber,
  setIsOnline,
}: {
  phoneNumber: string;
  setIsOnline: (message: boolean) => void;
}) {
  await newSocket.on(`isOffline_${phoneNumber}`, (data: {online: boolean}) => {
    setIsOnline(data.online);
  });
}
export async function online({
  phoneNumber,
  setIsOnline,
}: {
  phoneNumber: string;
  setIsOnline: (message: boolean) => void;
}) {
  await newSocket.on(`isOnline_${phoneNumber}`, (data: {online: boolean}) => {
    setIsOnline(data.online);
  });
}
export async function sendUpdatedMessages(data: {
  senderPhoneNumber: string;
  receiverPhoneNumber: string;
  messages: string[];
}) {
  await newSocket.emit('read', data);
}
export async function receiveReadUpdate(
  receiverPhoneNumber: string,
  senderPhoneNumber:string,
  callback: (message: string[]) => void,
) {
  await newSocket.on(`read_${senderPhoneNumber}_${receiverPhoneNumber}`, callback);
}
export async function receiveDeliveredStatus(
  senderPhoneNumber: string,
  callback: (message: string[]) => void,
) {
  await newSocket.on(`delivered_status_${senderPhoneNumber}`, callback);
}
