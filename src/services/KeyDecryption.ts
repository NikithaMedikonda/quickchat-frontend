import Sodium from 'react-native-libsodium';

export const keyDecryption = async ({
  encryptedPrivateKeyData,
  password,
}: {
  encryptedPrivateKeyData: string;
  password: string;
}) => {
    try {
    const { nonce, encrypted } = JSON.parse(encryptedPrivateKeyData);

    const nonceBytes = await Sodium.from_base64(nonce);
    const encryptedBytes = await Sodium.from_base64(encrypted);

    const passwordBytes = new TextEncoder().encode(password);
    const passwordBuffer = await Sodium.crypto_generichash(32, passwordBytes);

    const decryptedBytes = await Sodium.crypto_secretbox_open_easy(
      encryptedBytes,
      nonceBytes,
      passwordBuffer,
    );

    return Sodium.to_base64(decryptedBytes);
  } catch (error) {
    throw new Error(
      `Error while decrypting the private key ${(error as Error).message}`,
    );
  }
};
