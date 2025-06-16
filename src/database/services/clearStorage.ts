import {getDBInstance} from '../connection/connection';

export const clearLocalStorage = async () => {
  const db = await getDBInstance();
  const tableNames = [
    'Chats',
    'User',
    'Messages',
    'Queue',
    'Conversations',
    'UserRestrictions',
    'LocalUsers',
  ];

  for (const table of tableNames) {
    await db.executeSql(`DELETE FROM ${table}`);
  }
};
