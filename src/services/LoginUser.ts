import {API_URL} from '../constants/api';
import { getFCMToken } from '../permissions/NotificationPermissions';

export const loginUser = async (
  form: {phoneNumber: string; password: string},
  deviceId: string,
) => {
  const fcmToken = await getFCMToken();
  const userData = {
    ...form,
    deviceId,
    fcmToken,
  };
  const response = await fetch(`${API_URL}/api/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  let data;

  data = await response.json();

  return {
    status: response.status,
    data,
  };
};
