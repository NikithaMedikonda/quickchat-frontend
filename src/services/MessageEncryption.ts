import Sodium from 'react-native-libsodium';

export const messageEncryption = async ({
  message,
  myPrivateKey,
  recipientPublicKey,
}: {
  message: string;
  myPrivateKey: string;
  recipientPublicKey: string;
}) => {
  try {
    const nonce = await Sodium.randombytes_buf(24);
    const messageBytes = new TextEncoder().encode(message);
    const myPrivateKeyBytes = await Sodium.from_base64(myPrivateKey);
    const recipientPublicKeyBytes = await Sodium.from_base64(
      recipientPublicKey,
    );

    const encryptedMessage = await Sodium.crypto_box_easy(
      messageBytes,
      nonce,
      recipientPublicKeyBytes,
      myPrivateKeyBytes,
    );
    return JSON.stringify({
      nonce: await Sodium.to_base64(nonce),
      encrypted: await Sodium.to_base64(encryptedMessage),
    });
  } catch (error) {
    throw new Error(
      `Error while encrypting the message: ${(error as Error).message}`,
    );
  }
};
