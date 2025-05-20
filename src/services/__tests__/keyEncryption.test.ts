import CryptoJS from 'crypto-js';
import { keyEncryption } from '../keyEncryption';

jest.mock('crypto-js', () => ({
  AES: {
    encrypt: jest.fn(() => ({
      toString: jest.fn(() => 'mock-encrypted-value'),
    })),
  },
}));

describe('keyEncryption', () => {
  it('should encrypt the private key using the password', async () => {
    const result = await keyEncryption({
      privateKey: 'secret-key',
      password: 'Test@123',
    });

    expect(result).toBe('mock-encrypted-value');
    expect(CryptoJS.AES.encrypt).toHaveBeenCalledWith('secret-key', 'Test@123');
  });

  it('should throw an error when encryption fails', async () => {
    (CryptoJS.AES.encrypt as jest.Mock).mockImplementation(() => {
      throw new Error('Encryption failed');
    });

    await expect(
      keyEncryption({
        privateKey: 'secret-key',
        password: 'Test@123',
      })
    ).rejects.toThrow('Encryption failed');
  });
});
