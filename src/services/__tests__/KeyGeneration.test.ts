import { crypto_box_keypair, to_base64 } from 'react-native-libsodium';
import { keyGeneration } from '../keyGeneration';

jest.mock('react-native-libsodium', () => ({
  crypto_box_keypair: jest.fn(),
  to_base64: jest.fn(),
}));

describe('KeyGeneration', () => {
  it('should generate and return public and private keys', async () => {
    (crypto_box_keypair as jest.Mock).mockResolvedValue({
      publicKey: new Uint8Array([1, 2, 3]),
      privateKey: new Uint8Array([4, 5, 6]),
    });

    (to_base64 as jest.Mock).mockResolvedValueOnce('mockPublicKey');
    (to_base64 as jest.Mock).mockResolvedValueOnce('mockPrivateKey');

    const keys = await keyGeneration();

    expect(keys).toEqual({
      publicKey: 'mockPublicKey',
      privateKey: 'mockPrivateKey',
    });
  });

  it('should handle errors during key generation', async () => {
    (crypto_box_keypair as jest.Mock).mockImplementation(() => {
      throw new Error('Error occured while generating Keys');
    });

    await expect(keyGeneration()).rejects.toThrow('Error occured while generating Keys');
  });
});
