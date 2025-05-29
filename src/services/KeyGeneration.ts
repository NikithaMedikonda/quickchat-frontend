import {crypto_box_keypair, to_base64} from 'react-native-libsodium';

export const keyGeneration = async () => {
  try {
    const keys = await crypto_box_keypair();
    const publicKey = await to_base64(keys.publicKey);
    const privateKey = await to_base64(keys.privateKey);

    return {publicKey, privateKey};
  } catch (error) {
   throw new Error(
      `Error while generating the keys ${(error as Error).message}`,
    ); 
  }
};
