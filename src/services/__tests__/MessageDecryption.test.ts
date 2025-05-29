import Sodium from 'react-native-libsodium';
import {messageDecryption} from '../messageDecryption';

jest.mock('react-native-libsodium', () => ({
  from_base64: jest.fn((input: string) =>
    Uint8Array.from(Buffer.from(input, 'base64')),
  ),
  to_base64: jest.fn((input: Uint8Array) =>
    Buffer.from(input).toString('base64'),
  ),
  crypto_box_open_easy: jest.fn(() =>
    Uint8Array.from(Buffer.from('my-private-key')),
  ),
  to_string: jest.fn((input: Uint8Array) =>
    Buffer.from(input).toString('utf-8'),
  ),
}));

describe('Message Decryption', () => {
  it('should decrypt the message using shared key', async () => {
    const encryptedMessageJson = JSON.stringify({
      nonce: Buffer.from('nonce-value').toString('base64'),
      encrypted: Buffer.from('ciphermessage').toString('base64'),
    });

    const result = await messageDecryption({
      encryptedMessage: encryptedMessageJson,
      myPrivateKey: 'my-private-key',
      senderPublicKey: 'sender-public-key',
    });

    expect(result).toBe('my-private-key');
    expect(Sodium.crypto_box_open_easy).toHaveBeenCalled();
  });

  it('should throw an error when decryption fails', async () => {
    (Sodium.crypto_box_open_easy as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Decryption failed');
    });

    await expect(
      messageDecryption({
        encryptedMessage: JSON.stringify({
          nonce: Buffer.from('nonce-value').toString('base64'),
          encrypted: Buffer.from('ciphermessage').toString('base64'),
        }),
        myPrivateKey: 'my-private-key',
        senderPublicKey: 'sender-public-key',
      }),
    ).rejects.toThrow('Error while decrypting the message: Decryption failed');
  });
});
