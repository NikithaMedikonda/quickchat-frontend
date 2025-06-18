import {
  checkDeviceStatus,
  offline,
  online,
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
let mockOff: jest.Mock;

jest.mock('socket.io-client', () => {
  mockEmit = jest.fn();
  mockOn = jest.fn();
  mockOff = jest.fn();
  return jest.fn(() => ({
    emit: mockEmit,
    on: mockOn,
    off: mockOff,
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

  test('should test check device status', async () => {
    const userPhoneNumber = '+91 9440058809';
    const deviceId = 'device123';

    const responseData = {
      success: true,
      action: 'login',
      message: 'Device verified',
      registeredDeviceId: deviceId,
    };

    const handlers: Record<string, Function> = {};

    mockOn.mockImplementation((event, callback) => {
      handlers[event] = callback;
    });
    const promise = checkDeviceStatus(userPhoneNumber, deviceId);
    handlers.user_device_verified(responseData);
    const result = await promise;

    expect(mockEmit).toHaveBeenCalledWith(
      'check_user_device',
      userPhoneNumber,
      deviceId,
    );
    expect(result).toEqual(responseData);
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
  test('should call setIsOnline when isOnline event is received', async () => {
    const setIsOnline = jest.fn();
    const PhoneNumber = '+91 9440058809';
    mockOn.mockImplementation((event, callback) => {
      if (event === `isOnline_with_${PhoneNumber}`) {
        callback({isOnline: true});
      }
    });

    await receiveOnline({
      withChattingNumber: PhoneNumber,
      setIsOnline: setIsOnline,
    });

    expect(mockOn).toHaveBeenCalledWith(
      `isOnline_with_${PhoneNumber}`,
      expect.any(Function),
    );
    expect(setIsOnline).toHaveBeenCalledWith(true);
  });

  test('should call setIsOnline when offline event is received', async () => {
    const setIsOnline = jest.fn();
    const PhoneNumber = '+91 8522041688';
    mockOn.mockImplementation((event, callback) => {
      if (event === `offline_with_${PhoneNumber}`) {
        callback({online: false});
      }
    });

    await receiveOffline({
      withChattingNumber: PhoneNumber,
      setIsOnline,
    });

    expect(mockOn).toHaveBeenCalledWith(
      `offline_with_${PhoneNumber}`,
      expect.any(Function),
    );
    expect(setIsOnline).toHaveBeenCalledWith(false);
  });

  test('should call setSocketId when I-joined event is received with matching phone number', async () => {
    const userPhoneNumber = '+91 9866349126';
    const setSocketId = jest.fn();
    const mockSocketId = 'socket123';
    mockOn.mockImplementation((event, callback) => {
      if (event === 'I-joined') {
        callback({
          phoneNumber: userPhoneNumber,
          socketId: mockSocketId,
        });
      }
    });

    await receiveJoined({
      userPhoneNumber: userPhoneNumber,
      setSocketId,
    });

    expect(mockOn).toHaveBeenCalledWith('I-joined', expect.any(Function));
    expect(setSocketId).toHaveBeenCalledWith(mockSocketId);
  });

  test('should not call setSocketId when I-joined event is received with different phone number', async () => {
    const userPhoneNumber = '+91 9866349126';
    const setSocketId = jest.fn();
    mockOn.mockImplementation((event, callback) => {
      if (event === 'I-joined') {
        callback({
          phoneNumber: '+91 1234567890',
          socketId: 'socket123',
        });
      }
    });

    await receiveJoined({
      userPhoneNumber: userPhoneNumber,
      setSocketId,
    });

    expect(mockOn).toHaveBeenCalledWith('I-joined', expect.any(Function));
    expect(setSocketId).not.toHaveBeenCalled();
  });
  test('should register isOnline_<phoneNumber> event in online()', async () => {
    const setIsOnline = jest.fn();
    const phoneNumber = '+91 9999999999';

    await online({phoneNumber, setIsOnline});

    expect(mockOn).toHaveBeenCalledWith(
      `isOnline_${phoneNumber}`,
      expect.any(Function),
    );
  });
  test('should register isOffline_<phoneNumber> event in offline()', async () => {
    const setIsOnline = jest.fn();
    const phoneNumber = '+91 8888888888';

    await offline({phoneNumber, setIsOnline});

    expect(mockOn).toHaveBeenCalledWith(
      `isOffline_${phoneNumber}`,
      expect.any(Function),
    );
  });
  test('should call setIsOnline(true) when isOnline_<phoneNumber> event is triggered', async () => {
    const setIsOnline = jest.fn();
    const phoneNumber = '+91 7777777777';

    let handlerFn: (data: { online: boolean }) => void = () => {};
    mockOn.mockImplementation((event, callback) => {
      if (event === `isOnline_${phoneNumber}`) {
        handlerFn = callback;
      }
    });

    await online({phoneNumber, setIsOnline});

    handlerFn({online: true});

    expect(setIsOnline).toHaveBeenCalledWith(true);
  });

  test('should call setIsOnline(false) when isOffline_<phoneNumber> event is triggered', async () => {
    const setIsOnline = jest.fn();
    const phoneNumber = '+91 6666666666';

    let handlerFn: (data: { online: boolean }) => void = () => {};
    mockOn.mockImplementation((event, callback) => {
      if (event === `isOffline_${phoneNumber}`) {
        handlerFn = callback;
      }
    });

    await offline({phoneNumber, setIsOnline});

    handlerFn({online: false});

    expect(setIsOnline).toHaveBeenCalledWith(false);
  });
  test('should timeout if user_device_verified is not received in time', async () => {
    jest.useFakeTimers();
    const userPhoneNumber = '+91 9440058809';
    const deviceId = 'device123';

    const promise = checkDeviceStatus(userPhoneNumber, deviceId);
    jest.advanceTimersByTime(5000);

    await expect(promise).rejects.toThrow('Device check timeout');

    jest.useRealTimers();
  });
});
