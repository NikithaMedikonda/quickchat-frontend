import CryptoJS from 'crypto-js';

export const keyDecryption = async ({
  encryptedPrivateKey,
  password,
}: {
  encryptedPrivateKey: string;
  password: string;
}) => {
    try {
    const decryptedPrivateKey = CryptoJS.AES.decrypt(encryptedPrivateKey, password).toString();
    return decryptedPrivateKey;
    } catch (error) {
    throw new Error('Decryption error failed');
  }
};
