import Sodium from 'react-native-libsodium';
import { keyEncryption } from '../KeyEncryption';

jest.mock('react-native-libsodium', () => ({
  crypto_box_keypair: jest.fn(),
  to_base64: jest.fn((input: Uint8Array) => Buffer.from(input).toString('base64')),
  crypto_generichash: jest.fn(() => new Uint8Array(32).fill(1)),
  crypto_secretbox_easy: jest.fn(() => new Uint8Array(64).fill(2)),
  randombytes_buf: jest.fn(() => new Uint8Array(24).fill(3)),
}));

describe('keyEncryption', () => {
  it('should encrypt the private key using the password', async () => {
    const result = await keyEncryption({
      privateKey: 'secret-key',
      password: 'Test@123',
    });

    const parsed = JSON.parse(result);

    expect(typeof parsed.nonce).toBe('string');
    expect(typeof parsed.encrypted).toBe('string');
    expect(Sodium.randombytes_buf).toHaveBeenCalledWith(24);
    expect(Sodium.crypto_generichash).toHaveBeenCalled();
  });

  it('should throw an error when encryption fails', async () => {
    (Sodium.crypto_secretbox_easy as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Encryption failed');
    });

    await expect(
      keyEncryption({
        privateKey: 'secret-key',
        password: 'Test@123',
      })
    ).rejects.toThrow('Error while encrypting the private key Encryption failed');
  });
});
