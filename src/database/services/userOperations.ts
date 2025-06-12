import {SQLiteDatabase} from 'react-native-sqlite-storage';
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
