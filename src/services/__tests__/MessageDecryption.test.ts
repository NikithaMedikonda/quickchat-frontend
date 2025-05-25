import Sodium from 'react-native-libsodium';
import { messageDecryption } from '../messageDecryption';

jest.mock('react-native-libsodium', () => ({
  from_base64: jest.fn((input: string) => Uint8Array.from(Buffer.from(input, 'base64'))),
    to_base64: jest.fn((input: Uint8Array) =>
    Buffer.from(input).toString('base64'),
  ),
  crypto_secretbox_open_easy: jest.fn(() =>  Uint8Array.from(Buffer.from('shared-key'))),
}));

describe('Message Decryption', () => {
 it('should decrypt the message using shared key', async () => {
    const encryptedMessageJson = JSON.stringify({
      nonce: Buffer.from('nonce-value').toString('base64'),
      encrypted: Buffer.from('ciphermessage').toString('base64'),
    });

    const result = await messageDecryption({
      encryptedMessage: encryptedMessageJson,
      sharedKey: 'shared-key',
    });

    expect(result).toBe(Buffer.from('shared-key').toString('base64'));
    expect(Sodium.crypto_secretbox_open_easy).toHaveBeenCalled();
  });

  it('should throw an error when decryption fails', async () => {
      (Sodium.crypto_secretbox_open_easy as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Decryption failed');
      });

      await expect(
        messageDecryption({
          encryptedMessage: JSON.stringify({
            nonce: Buffer.from('nonce-value').toString('base64'),
            encrypted: Buffer.from('ciphermessage').toString('base64'),
          }),
          sharedKey: 'shared-key',
        })
      ).rejects.toThrow('Error while decrypting the message: Decryption failed');
    });
});
