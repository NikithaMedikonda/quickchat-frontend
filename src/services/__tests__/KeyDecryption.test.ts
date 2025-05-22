import Sodium from 'react-native-libsodium';
import { keyDecryption } from '../KeyDecryption';

jest.mock('react-native-libsodium', () => ({
  to_base64: jest.fn((input: Uint8Array) => Buffer.from(input).toString('base64')),
  from_base64: jest.fn((input: string) => Uint8Array.from(Buffer.from(input, 'base64'))),
  crypto_generichash: jest.fn(() => new Uint8Array(32).fill(1)),
  crypto_secretbox_open_easy: jest.fn(() =>  Uint8Array.from(Buffer.from('secret-key'))),
}));

describe('keyDecryption', () => {
 it('should decrypt the private key using the password', async () => {
    const encryptedJson = JSON.stringify({
      nonce: Buffer.from('nonce-value').toString('base64'),
      encrypted: Buffer.from('ciphertext').toString('base64'),
    });

    const result = await keyDecryption({
      encryptedPrivateKeyData: encryptedJson,
      password: 'Test@123',
    });

    expect(result).toBe(Buffer.from('secret-key').toString('base64'));
    expect(Sodium.crypto_generichash).toHaveBeenCalled();
    expect(Sodium.crypto_secretbox_open_easy).toHaveBeenCalled();
  });

  it('should throw an error when decryption fails', async () => {
    (Sodium.crypto_secretbox_open_easy as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Decryption failed');
    });

    await expect(
      keyDecryption({
        encryptedPrivateKeyData: JSON.stringify({
          nonce: Buffer.from('nonce-value').toString('base64'),
          encrypted: Buffer.from('ciphertext').toString('base64'),
        }),
        password: 'Test@123',
      })
    ).rejects.toThrow('Error while decrypting the private key Decryption failed');
  });
});
