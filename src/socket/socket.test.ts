import {
  receiveJoined,
  receiveOffline,
  receiveOnline,
  receivePrivateMessage,
  sendPrivateMessage,
  socketConnection,
} from '../socket/socket';
import { SentPrivateMessage } from '../types/messsage.types';

let mockEmit: jest.Mock;
let mockOn: jest.Mock;

jest.mock('socket.io-client', () => {
  mockEmit = jest.fn();
  mockOn = jest.fn();
  return jest.fn(() => ({
    emit: mockEmit,
    on: mockOn,
  }));
});

describe('should test socket functions', () => {
  beforeEach(() => {
    mockEmit.mockClear();
    mockOn.mockClear();
  });

  test('should emit join event on socketConnection', async () => {
    await socketConnection('+91 9440058809');
    expect(mockEmit).toHaveBeenCalledWith('join', '+91 9440058809');
  });

  test('should emit send_private_message event on sendPrivateMessage', async () => {
    const payload: SentPrivateMessage = {
      recipientPhoneNumber: '+91 9440058809',
      senderPhoneNumber: '+91 8522041688',
      message: 'Hello!',
      timestamp: '2024-05-22T12:00:00Z',
      status: 'sent',
    };
    await sendPrivateMessage(payload);
    expect(mockEmit).toHaveBeenCalledWith('send_private_message', {
      recipientPhoneNumber: payload.recipientPhoneNumber,
      message: payload.message,
      senderPhoneNumber: payload.senderPhoneNumber,
      timestamp: payload.timestamp,
    });
  });

  test('should register listener on receivePrivateMessage', async () => {
    const callback = jest.fn();
    const senderPhoneNumber = '+91 9440058809';

    await receivePrivateMessage(senderPhoneNumber, callback);

    expect(mockOn).toHaveBeenCalledWith(
      `receive_private_message_${senderPhoneNumber}`,
      callback,
    );
  });
  test('should receive isOnline with', async () => {
    const setIsOnline = jest.fn();
    const PhoneNumber = '+91 9440058809';
    await receiveOnline({
      withChattingNumber: PhoneNumber,
      setIsOnline: setIsOnline,
    });
    expect(mockOn).toHaveBeenCalledTimes(1);
  });
  test('should receive offline with', async () => {
    const setIsOnline = jest.fn();
    const PhoneNumber = '+91 8522041688';
    await receiveOffline({withChattingNumber: PhoneNumber, setIsOnline});
    expect(mockOn).toHaveBeenCalledTimes(1);
  });
  test('should receive socket event if there is any user joined', async () => {
    const userPhoneNumber = '+91 9866349126';
    const setSocketId = jest.fn();
    await receiveJoined({userPhoneNumber: userPhoneNumber, setSocketId});
    expect(mockOn).toHaveBeenCalledTimes(1);
  });
});
