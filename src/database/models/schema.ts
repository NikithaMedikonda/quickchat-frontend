import {SQLiteDatabase} from 'react-native-sqlite-storage';

export const createTables = async (db: SQLiteDatabase) => {
  await db.executeSql(`CREATE TABLE IF NOT EXISTS Chats (
      id TEXT PRIMARY KEY,
      userAPhoneNumber TEXT,
      userBPhoneNumber TEXT,
      lastMessage TEXT,
      lastMessageTimestamp TEXT,
      lastMessageType TEXT CHECK(lastMessageType IN ('sent', 'received')),
      lastMessageStatus TEXT,
      unReadCount INTEGER,
      lastSyncedAt TEXT
    );
  `);

  await db.executeSql(`CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY,
    phoneNumber TEXT,
    lastSyncedAt TEXT);
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS Messages (
      id TEXT PRIMARY KEY,
      chatId TEXT,
      senderPhoneNumber TEXT,
      receiverPhoneNumber TEXT,
      message TEXT,
      status TEXT CHECK(status IN ('delivered', 'sent', 'read','pending')) DEFAULT 'sent',
      timestamp TEXT
    );
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS Queue (
      id TEXT PRIMARY KEY,
      chatId TEXT,
      senderPhoneNumber TEXT,
      receiverPhoneNumber TEXT,
      message TEXT,
      timestamp TEXT,
      status TEXT CHECK(status IN ('pending', 'sent', 'failed')) DEFAULT 'pending'
    );
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS Conversations (
      chatId TEXT NOT NULL,
      userPhoneNumber TEXT NOT NULL,
      isDeleted NUMBER DEFAULT 0,
      lastClearedAt TEXT,
      PRIMARY KEY (chatId, userPhoneNumber)
    );`);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS UserRestrictions (
      id TEXT PRIMARY KEY,
      blockerPhoneNumber TEXT,
      blockedPhoneNumber TEXT
    );`);

  await db.executeSql(`
  CREATE TABLE IF NOT EXISTS LocalUsers (
    phoneNumber TEXT PRIMARY KEY,
    name TEXT,
    profilePicture TEXT,
    publicKey TEXT
  );
`);

};
