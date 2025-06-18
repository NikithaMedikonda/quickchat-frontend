import {SQLiteDatabase} from 'react-native-sqlite-storage';
import RNFetchBlob from 'rn-fetch-blob';
import {getDBInstance} from '../connection/connection';

export const upsertUserInfo = async (
  db: SQLiteDatabase,
  user: {
    phoneNumber: string;
    name?: string;
    profilePicture: string;
    publicKey: string;
  },
) => {
  await db.executeSql(
    `INSERT OR REPLACE INTO LocalUsers (phoneNumber, name, profilePicture, publicKey)
     VALUES (?, ?, ?, ?)`,
    [user.phoneNumber, user.name || '', user.profilePicture, user.publicKey],
  );
};

export const isUserStoredLocally = async (
  db: SQLiteDatabase,
  phoneNumber: string,
): Promise<boolean> => {
  const [res] = await db.executeSql(
    'SELECT * FROM LocalUsers WHERE phoneNumber = ?',
    [phoneNumber],
  );
  return res.rows.length > 0;
};

export const createUserInstance = async (
  phoneNumber: string,
  lastSyncedAt: string,
) => {
  const db = await getDBInstance();
  await db.executeSql(
    `INSERT OR IGNORE INTO User (phoneNumber,lastSyncedAt)
           VALUES (?,?)`,
    [phoneNumber, lastSyncedAt ? lastSyncedAt : new Date(0)],
  );
};

export const getLastSyncedTime = async (phoneNumber: string) => {
  const db = await getDBInstance();
  const [result] = await db.executeSql(
    'SELECT lastSyncedAt FROM User WHERE phoneNumber = ?',
    [phoneNumber],
  );

  if (result.rows.length > 0) {
    return result.rows.item(0).lastSyncedAt;
  } else {
    const defaultDate = new Date(0).toISOString();
    await createUserInstance(phoneNumber, defaultDate);
    return defaultDate;
  }
};

export const updateLastSyncedTime = async (
  timestamp: string,
  phoneNumber: string,
) => {
  const db = await getDBInstance();
  await db.executeSql(
    'UPDATE User SET lastSyncedAt = ? WHERE phoneNumber = ?',
    [timestamp, phoneNumber],
  );
};

export const getAllUniquePhoneNumbers = async (): Promise<string[]> => {
  try {
    const db = await getDBInstance();
    const results = await db.executeSql(`
      SELECT DISTINCT userAPhoneNumber AS phoneNumber FROM Chats
      UNION
      SELECT DISTINCT userBPhoneNumber AS phoneNumber FROM Chats;
    `);
    const phoneNumbers: string[] = [];
    if (results.length > 0) {
      const resultSet = results[0];
      const rows = resultSet.rows;
      for (let i = 0; i < rows.length; i++) {
        const item = rows.item(i);
        phoneNumbers.push(item.phoneNumber);
      }
    }
    return phoneNumbers;
  } catch (error) {
    return [];
  }
};

export const convertUrlToBase64 = async (url: string): Promise<string> => {
  try {
    const res = await RNFetchBlob.config({ fileCache: false }).fetch('GET', url);
    const base64Image = await res.base64();
    return base64Image;
  } catch (error) {
    return '';
  }
};


type UserProfile = {
  phoneNumber: string;
  profilePicture: string;
};

export const updateUserProfilePictures = async (
  db: SQLiteDatabase,
  profiles: UserProfile[] | undefined | null
): Promise<void> => {
  if (!profiles || !Array.isArray(profiles)) {
    return;
  }

  for (const { phoneNumber, profilePicture } of profiles) {
    try {
      if (!profilePicture) {
        continue;
      }
      const base64Image = await convertUrlToBase64(profilePicture);
      if (base64Image) {
        await db.executeSql(
          'INSERT OR REPLACE INTO LocalUsers (phoneNumber, profilePicture) VALUES (?, ?);',
          [phoneNumber, base64Image]
        );
      }
    } catch {
    }
  }
};


