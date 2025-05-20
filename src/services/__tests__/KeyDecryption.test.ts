import CryptoJS from 'crypto-js';
import { keyDecryption } from '../keyDecryption';

jest.mock('crypto-js', () => ({
  AES: {
    decrypt: jest.fn(() => ({
      toString: jest.fn(() => 'secret-key'),
    })),
  },
}));

describe('keyDecryption', () => {
 it('should decrypt the private key using the password', async () => {
    const result = await keyDecryption({
      encryptedPrivateKey: 'encrypted-value',
      password: 'Test@123',
    });

    expect(result).toBe('secret-key');
    expect(CryptoJS.AES.decrypt).toHaveBeenCalledWith('encrypted-value', 'Test@123');
  });

  it('should throw an error when decryption fails', async () => {
    (CryptoJS.AES.decrypt as jest.Mock).mockImplementation(() => {
      throw new Error('Decryption failed');
    });

    await expect(
      keyDecryption({
        encryptedPrivateKey: 'encrypted-value',
        password: 'Test@123',
      })
    ).rejects.toThrow('Decryption failed');
  });
});
