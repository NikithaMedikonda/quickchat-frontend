import Sodium from 'react-native-libsodium';

export const messageDecryption = async ({
  encryptedMessage,
  sharedKey,
}: {
  encryptedMessage: string;
  sharedKey: string;
}) => {
  try {
    const {nonce, encrypted} = JSON.parse(encryptedMessage);

  const nonceBytes = Sodium.from_base64(nonce);
  const encryptedBytes = Sodium.from_base64(encrypted);
  const keyBytes = Sodium.from_base64(sharedKey);

  const decryptedMessage = await Sodium.crypto_secretbox_open_easy(
    encryptedBytes,
    nonceBytes,
    keyBytes,
  );

  return Sodium.to_base64(decryptedMessage);
  } catch (error) {
 throw new Error(
      `Error while decrypting the message: ${(error as Error).message}`,
    );
  }
};
