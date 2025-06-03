import {
  checkDeviceStatus,
  receivePrivateMessage,
  sendPrivateMessage,
  socketConnection,
} from '../socket/socket';
import {SentPrivateMessage} from '../types/messsage.types';

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

    const result = await receivePrivateMessage(senderPhoneNumber, callback);

    expect(mockOn).toHaveBeenCalledWith(
      `receive_private_message_${senderPhoneNumber}`,
      callback,
    );
    expect(result).toEqual({
      recipientPhoneNumber: '',
      message: '',
      senderPhoneNumber: '',
      timestamp: '',
      status: '',
    });
  });
});
