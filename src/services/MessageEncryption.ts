import Sodium from 'react-native-libsodium';

export const messageEncryption = async ({
  message,
  secretKey,
}: {
  message: string;
  secretKey: string;
}) => {
  try {
    const nonce = await Sodium.randombytes_buf(24);
    const keyBytes = Sodium.from_base64(secretKey);
    const encryptedMessage = await Sodium.crypto_secretbox_easy(
      message,
      nonce,
      keyBytes,
    );
    return JSON.stringify({
      nonce: Sodium.to_base64(nonce),
      encrypted: Sodium.to_base64(encryptedMessage),
    });
  } catch (error) {
    throw new Error(
      `Error while encrypting the message: ${(error as Error).message}`,
    );
  }
};
