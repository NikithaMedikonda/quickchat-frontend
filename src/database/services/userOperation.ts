import {getDBInstance} from '../connection/connection';

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

export const getLasySyncedTime = async (phoneNumber: string) => {
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
