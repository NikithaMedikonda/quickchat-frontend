import Sodium from 'react-native-libsodium';

export const keyEncryption = async ({
  privateKey,
  password,
}: {
  privateKey: string;
  password: string;
}) => {
  try {
    const nonce = await Sodium.randombytes_buf(24);
    const passwordBytes = new TextEncoder().encode(password);
    const passwordBuffer = await Sodium.crypto_generichash(32, passwordBytes);

    const encryptedPrivateKey = await Sodium.crypto_secretbox_easy(
      privateKey,
      nonce,
      passwordBuffer,
    );

    return JSON.stringify({
      nonce: Sodium.to_base64(nonce),
      encrypted: Sodium.to_base64(encryptedPrivateKey),
    });
  } catch (error) {
    throw new Error(
      `Error while encrypting the private key ${(error as Error).message}`,
    );
  }
};
