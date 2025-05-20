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
    } catch (error: any) {
    throw new Error(error.message || 'Decryption error');
  }
};
