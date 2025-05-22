import {crypto_box_keypair, to_base64} from 'react-native-libsodium';

export const keyGeneration = async () => {
  try {
    const keys = await crypto_box_keypair();

    const publicKey =
      typeof keys.publicKey === 'string'
        ? keys.publicKey
        : await to_base64(keys.publicKey);
    const privateKey =
      typeof keys.privateKey === 'string'
        ? keys.privateKey
        : await to_base64(keys.privateKey);
    return {publicKey, privateKey};
  } catch (error) {
    throw new Error(
      `Error while generating the keys ${(error as Error).message}`,
    );
  }
};