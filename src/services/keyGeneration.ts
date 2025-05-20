import Rsa from 'react-native-rsa';

export const KeyGeneration = async () => {
  const rsa = new Rsa();
  const bits = 2048;
  const exponent = '10001';
  try {
    const keys: { public: string; private: string } = await rsa.generateKeys(bits, exponent);
    const publicKey = keys.public;
    const privateKey = keys.private;
    return { publicKey, privateKey };
  } catch (error: any) {
    throw new Error(error.message || 'Generation error');
  }
};
