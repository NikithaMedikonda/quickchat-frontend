import {API_URL} from '../constants/api';
import {getAllUniquePhoneNumbers} from '../database/services/userOperations';
type UserProfile = {
  phoneNumber: string;
  profilePicture: string;
  publicKey: string;
};

export const fetchProfileUrls = async (): Promise<UserProfile[]> => {
  try {
    const phoneNumbers = await getAllUniquePhoneNumbers();
    if (phoneNumbers.length === 0) {
      return [];
    }
    const response = await fetch(`${API_URL}/api/getProfileUrls`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({phoneNumbers}),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    return [];
  }
};
