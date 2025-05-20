import Rsa from 'react-native-rsa';

export const keyGeneration = async () => {
  const rsa = new Rsa();
  const bits = 2048;
  const exponent = '10001';
  try {
    const keys: { public: string; private: string } = await rsa.generateKeys(bits, exponent);
    const publicKey = keys.public;
    const privateKey = keys.private;
    return { publicKey, privateKey };
  } catch (error) {
    throw new Error('Error occured while generating Keys');
  }
};
