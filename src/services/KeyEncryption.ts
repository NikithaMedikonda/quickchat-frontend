import CryptoJS from 'crypto-js';

export const keyEncryption = async ({
  privateKey,
  password,
}: {
  privateKey: string;
  password: string;
}) => {
  try {
    const encryptedPrivateKey = CryptoJS.AES.encrypt(privateKey, password).toString();
    return encryptedPrivateKey;
  } catch (error: any) {
    throw new Error(error.message || 'Encryption error');
  }
};
