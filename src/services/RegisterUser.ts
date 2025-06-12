import { API_URL } from '../constants/api';
import { getFCMToken } from '../permissions/NotificationPermissions';
import { keyEncryption } from './KeyEncryption';

export const registerUser = async (
  payload: {
    image: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    password: string;
    email: string | null;
  },
  keys: {
    publicKey: string;
    privateKey: string;
  },
  deviceId: {deviceId: string},
) => {
  const encryptedPrivateKey = await keyEncryption({
    privateKey: keys.privateKey,
    password: payload.password,
  });
  const fcmToken = await getFCMToken();
  const userData = {
    phoneNumber: payload.phoneNumber,
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    profilePicture: payload.image,
    email: payload.email?.trim() || null,
    password: payload.password,
    publicKey: keys.publicKey,
    privateKey: encryptedPrivateKey,
    deviceId:deviceId.deviceId,
    fcmToken:fcmToken,
  };

  try {
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }
    return {
      status: response.status,
      data,
    };
  } catch (error) {
    throw error;
  }
};
