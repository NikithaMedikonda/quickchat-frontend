import {getDBInstance} from '../connection/connection';

export const clearChatLocally = async (
  chatId: string,
  userPhoneNumber: string,
  timestamp: number,
) => {
  const db = await getDBInstance();
  const lastClearedAt = new Date(timestamp).toISOString();
  const existing = await db.executeSql(
    'SELECT * FROM Conversations WHERE chatId = ? AND userPhoneNumber = ?',
    [chatId, userPhoneNumber],
  );

  if (existing[0].rows.length > 0) {
    await db.executeSql(
      'UPDATE Conversations SET lastClearedAt = ?, isDeleted = 1 WHERE chatId = ? AND userPhoneNumber = ?',
      [lastClearedAt, chatId, userPhoneNumber],
    );
  } else {
    await db.executeSql(
      'INSERT INTO Conversations (chatId, userPhoneNumber, lastClearedAt, isDeleted) VALUES (?, ?, ?, 1)',
      [chatId, userPhoneNumber, lastClearedAt],
    );
  }
};
