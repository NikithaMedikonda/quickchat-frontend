import Sodium from 'react-native-libsodium';
import {messageEncryption} from '../MessageEncryption';

jest.mock('react-native-libsodium', () => ({
  to_base64: jest.fn((input: Uint8Array) =>
    Buffer.from(input).toString('base64'),
  ),
  crypto_box_easy: jest.fn(() => new Uint8Array(64).fill(1)),
  randombytes_buf: jest.fn(() => new Uint8Array(24).fill(3)),
  from_base64: jest.fn((input: string) =>
    Uint8Array.from(Buffer.from(input, 'base64')),
  ),
}));

describe('Message Encryption', () => {
  it('should encrypt the message using secret key', async () => {
    const result = await messageEncryption({
      message: 'hello',
      myPrivateKey: 'my-private-key',
      recipientPublicKey: 'receiver-public-key',
    });

    const parsed = JSON.parse(result);

    expect(typeof parsed.nonce).toBe('string');
    expect(typeof parsed.encrypted).toBe('string');
    expect(Sodium.from_base64).toHaveBeenCalled();
    expect(Sodium.randombytes_buf).toHaveBeenCalledWith(24);
  });

  it('should throw an error when encryption fails', async () => {
    (Sodium.crypto_box_easy as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Encryption failed');
    });

    await expect(
      messageEncryption({
        message: 'hello',
        myPrivateKey: 'my-private-key',
        recipientPublicKey: 'receiver-public-key',
      }),
    ).rejects.toThrow('Error while encrypting the message: Encryption failed');
  });
});
