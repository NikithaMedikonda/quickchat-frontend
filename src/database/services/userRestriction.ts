import { getDBInstance } from '../connection/connection';

const generateId = (blockerPhoneNumber: string, blockedPhoneNumber: string) => {
  return `${blockerPhoneNumber}_${blockedPhoneNumber}_${Date.now()}`;
};

export const insertUserRestriction = async (
  blockerPhoneNumber: string,
  blockedPhoneNumber: string,
) => {
  const db = await getDBInstance();
  const id = generateId(blockerPhoneNumber, blockedPhoneNumber);
  await db.executeSql(
    `INSERT INTO UserRestrictions (id, blockerPhoneNumber, blockedPhoneNumber)
       VALUES (?, ?, ?)`,
    [id, blockerPhoneNumber, blockedPhoneNumber],
  );
};

export const deleteUserRestriction = async (
  blockerPhoneNumber: string,
  blockedPhoneNumber: string,
) => {
  const db = await getDBInstance();
  await db.executeSql(
    `DELETE FROM UserRestrictions
       WHERE blockerPhoneNumber = ? AND blockedPhoneNumber = ?`,
    [blockerPhoneNumber, blockedPhoneNumber],
  );
};

export const checkBlockedStatusLocal = async (
  blockerPhoneNumber: string,
  blockedPhoneNumber: string,
) => {
  const db = await getDBInstance();
  const [result] = await db.executeSql(
    `SELECT * FROM UserRestrictions
       WHERE blockerPhoneNumber = ? AND blockedPhoneNumber = ?`,
    [blockerPhoneNumber, blockedPhoneNumber],
  );
  return result.rows.length > 0;
};
