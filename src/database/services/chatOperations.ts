import {SQLiteDatabase} from 'react-native-sqlite-storage';
import {numberNameIndex} from '../../helpers/nameNumberIndex';
import {normalise} from '../../helpers/normalisePhoneNumber';
import {getUserByPhoneNumber} from '../../services/GetUser';
import {setUnreadCount} from '../../store/slices/unreadChatSlice';
import {store} from '../../store/store';
import {createChatId} from '../../utils/chatId';
import {getDBInstance} from '../connection/connection';
import {isUserStoredLocally, upsertUserInfo} from './userOperations';

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
  await db.executeSql('DELETE FROM CHATS WHERE id=?', [chatId]);
};

export const upsertChatMetadata = async (
  senderPhoneNumber: string,
  receiverPhoneNumber: string,
  message: string,
  timestamp: string,
  status: string,
  isSenderCurrentUser: boolean,
) => {
  const chatId = createChatId(senderPhoneNumber, receiverPhoneNumber);
  const lastMessageType = isSenderCurrentUser ? 'sent' : 'received';
  const db = await getDBInstance();
  const [result] = await db.executeSql(
    'SELECT unReadCount FROM Chats WHERE id = ?',
    [chatId],
  );

  let unreadCount = 0;
  if (result.rows.length > 0) {
    const currentUnread = result.rows.item(0).unReadCount || 0;
    unreadCount = isSenderCurrentUser ? currentUnread : currentUnread + 1;
  } else {
    unreadCount = isSenderCurrentUser ? 0 : 1;
  }

  await db.executeSql(
    `INSERT OR REPLACE INTO Chats (
      id, userAPhoneNumber, userBPhoneNumber, lastMessage,
      lastMessageTimestamp, lastMessageType, lastMessageStatus,
      unReadCount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      chatId,
      senderPhoneNumber,
      receiverPhoneNumber,
      message,
      timestamp,
      lastMessageType,
      status,
      unreadCount,
    ],
  );
  const totalUnread = await getTotalUnreadCount(db);
  store.dispatch(setUnreadCount(totalUnread));
};
export const updateChatMetadata = async (
  senderPhoneNumber: string,
  receiverPhoneNumber: string,
  message: string,
  status: string,
) => {
  const db = await getDBInstance();
  const ChatId = await createChatId(senderPhoneNumber, receiverPhoneNumber);
  const query =
    'UPDATE Chats SET lastMessageStatus=? WHERE id=? AND lastMessage=?  ';
  await db.executeSql(query, [status, ChatId, message]);
};
export const resetUnreadCount = async (db: SQLiteDatabase, chatId: string) => {
  await db.executeSql('UPDATE Chats SET unReadCount = 0 WHERE id = ?', [
    chatId,
  ]);
};

export const getTotalUnreadCount = async (
  db: SQLiteDatabase,
): Promise<number> => {
  const [res] = await db.executeSql(
    'SELECT COUNT(*) as unreadChats FROM Chats WHERE unReadCount > 0',
  );
  return res.rows.item(0).unreadChats;
};

export interface LocalChat {
  chatId: string;
  contactName: string;
  contactProfilePic: string | null;
  phoneNumber: string;
  lastMessageText: string;
  lastMessageType: 'sentMessage' | 'receivedMessage';
  lastMessageStatus: 'sent' | 'delivered' | 'read';
  lastMessageTimestamp: string;
  unreadCount: number;
  publicKey: string;
}

export const getAllChatsFromLocal = async (
  db: SQLiteDatabase,
  currentUserPhone: string,
): Promise<LocalChat[]> => {
  const [res] = await db.executeSql(
    `SELECT * FROM Chats
     WHERE userAPhoneNumber = ? OR userBPhoneNumber = ?
     ORDER BY lastMessageTimestamp DESC`,
    [currentUserPhone, currentUserPhone],
  );

  const phoneNameMap = await numberNameIndex();
  const allChats: LocalChat[] = [];

  for (let i = 0; i < res.rows.length; i++) {
    const row = res.rows.item(i);

    const contactPhone =
      row.userAPhoneNumber === currentUserPhone
        ? row.userBPhoneNumber
        : row.userAPhoneNumber;

    const contactName = phoneNameMap
      ? phoneNameMap[normalise(contactPhone)] ?? contactPhone
      : contactPhone;
    const [userResult] = await db.executeSql(
      'SELECT * FROM LocalUsers WHERE phoneNumber = ?',
      [contactPhone],
    );
    const exists = await isUserStoredLocally(db, contactPhone);
    if (!exists) {
      const remoteUser = await getUserByPhoneNumber(contactPhone);
      if (remoteUser) {
        await upsertUserInfo(db, {
          phoneNumber: contactPhone,
          profilePicture: remoteUser.profilePicture,
          publicKey: remoteUser.publicKey,
        });
      }
    }
    const userRow = userResult.rows.length > 0 ? userResult.rows.item(0) : null;
    console.log('User row:', row);
    allChats.push({
      chatId: row.id,
      contactName: contactName,
      contactProfilePic: userRow ? userRow.profilePicture : null,
      phoneNumber: contactPhone,
      lastMessageText: row.lastMessage,
      lastMessageType:
        row.lastMessageType === 'sent' ? 'sentMessage' : 'receivedMessage',
      lastMessageStatus: row.lastMessageStatus,
      lastMessageTimestamp: row.lastMessageTimestamp,
      unreadCount: row.unReadCount,
      publicKey: userRow ? userRow.publicKey : undefined,
    });
  }
  return allChats;
};
