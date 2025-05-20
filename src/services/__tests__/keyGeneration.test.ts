import Rsa from 'react-native-rsa';
import { KeyGeneration } from '../keyGeneration';


jest.mock('react-native-rsa', () => {
  return jest.fn().mockImplementation(() => ({
    generateKeys: jest.fn().mockResolvedValue({
      public: 'mockPublicKey',
      private: 'mockPrivateKey',
    }),
  }));
});

describe('KeyGeneration', () => {
  it('should generate and return public and private keys', async () => {
    const keys = await KeyGeneration();
    expect(keys).toEqual({
      publicKey: 'mockPublicKey',
      privateKey: 'mockPrivateKey',
    });
  });

  it('should handle errors during key generation', async () => {
    (Rsa as jest.Mock).mockImplementation(() => {
      throw new Error('Generation error');
    });

    await expect(
      KeyGeneration()).rejects.toThrow('Generation error');
  });
});
