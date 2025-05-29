import Sodium from 'react-native-libsodium';

export const messageDecryption = async ({
  encryptedMessage,
  myPrivateKey,
  senderPublicKey,
}: {
  encryptedMessage: string;
  myPrivateKey: string;
  senderPublicKey: string;
}) => {
  try {
    const {nonce, encrypted} = JSON.parse(encryptedMessage);

    const nonceBytes = await Sodium.from_base64(nonce);
    const encryptedBytes = await Sodium.from_base64(encrypted);
    const myPrivateKeyBytes = await Sodium.from_base64(myPrivateKey);
    const senderPublicKeyBytes = await Sodium.from_base64(senderPublicKey);

    const decryptedBytes = await Sodium.crypto_box_open_easy(
      encryptedBytes,
      nonceBytes,
      senderPublicKeyBytes,
      myPrivateKeyBytes,
    );
    return Sodium.to_string(decryptedBytes);
  } catch (error) {
    throw new Error(
      `Error while decrypting the message: ${(error as Error).message}`,
    );
  }
};
