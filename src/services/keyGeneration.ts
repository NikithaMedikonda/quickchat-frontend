import Rsa from 'react-native-rsa';

export const KeyGeneration = async () => {
  const rsa = new Rsa();
  const bits = 2048;
  const exponent = '10001';
  try {
    const keys: { public: string; private: string } = await rsa.generateKeys(bits, exponent);
    const publicKey = keys.public;
    const privateKey = keys.private;
    console.log(publicKey);
    console.log(privateKey);
    return { publicKey, privateKey };
  } catch (error) {
    console.error('Key generation failed:', error);
    return null;
  }
};
