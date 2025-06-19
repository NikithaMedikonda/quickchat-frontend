import EncryptedStorage from 'react-native-encrypted-storage';
import {SQLiteDatabase} from 'react-native-sqlite-storage';
import {getUserByPhoneNumber} from '../../services/GetUser';
import {incrementTrigger} from '../../store/slices/chatSlice';
import {store} from '../../store/store';
import {createChatId} from '../../utils/chatId';
import {getDBInstance} from '../connection/connection';
import {MessageType} from '../types/message';
import {
  getTotalUnreadCount,
  updateChatMetadata,
  upsertChatMetadata,
} from './chatOperations';
import {isUserStoredLocally, upsertUserInfo} from './userOperations';
import {sendUpdatedMessages} from '../../socket/socket';
import {setUnreadCount} from '../../store/slices/unreadChatSlice';
import {fetchAndConvertToBase64} from './chatOperations';

export const insertToMessages = async (message: MessageType) => {
  const db = await getDBInstance();
  const messagetoInsert = {
    id: message.id,
    chatId: createChatId(
      message.receiverPhoneNumber,
      message.senderPhoneNumber,
    ),
    senderPhoneNumber: message.senderPhoneNumber,
    receiverPhoneNumber: message.receiverPhoneNumber,
    message: message.message,
    status: message.status,
    timestamp: message.timestamp,
  };
  const messageResult = await db.executeSql(
    'SELECT * FROM Messages WHERE message = ?',
    [messagetoInsert.message],
  );
  if (messageResult[0].rows.length > 0) {
    return;
  }
  await db.executeSql(
    `INSERT OR IGNORE INTO Messages
          (id, chatId, senderPhoneNumber, receiverPhoneNumber, message, status, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      String(messagetoInsert.id),
      messagetoInsert.chatId,
      String(messagetoInsert.senderPhoneNumber),
      String(messagetoInsert.receiverPhoneNumber),
      messagetoInsert.message,
      messagetoInsert.status,
      messagetoInsert.timestamp,
    ],
  );

  const currentUser = await EncryptedStorage.getItem('user');
  if (!currentUser) {
    return;
  }
  const parsedUser = JSON.parse(currentUser);
  const currentUserPhoneNumber = parsedUser.phoneNumber;

  if (currentUserPhoneNumber) {
    const sender = message.senderPhoneNumber;
    const isSenderCurrentUser = sender === currentUserPhoneNumber;

    if (!isSenderCurrentUser) {
      const exists = await isUserStoredLocally(db, sender);
      if (!exists) {
        const remoteUser = await getUserByPhoneNumber(
          messagetoInsert.senderPhoneNumber,
        );
        const profileBase64 = remoteUser?.profilePicture
          ? await fetchAndConvertToBase64(remoteUser.profilePicture)
          : null;
        if (remoteUser) {
          await upsertUserInfo(db, {
            phoneNumber: sender,
            profilePicture: profileBase64,
            publicKey: remoteUser.publicKey,
          });
        }
      }
    } else {
      const exists = await isUserStoredLocally(db, sender);
      if (!exists) {
        const remoteUser = await getUserByPhoneNumber(
          messagetoInsert.receiverPhoneNumber,
        );
        const profileBase64 = remoteUser?.profilePicture
          ? await fetchAndConvertToBase64(remoteUser.profilePicture)
          : null;
        if (remoteUser) {
          await upsertUserInfo(db, {
            phoneNumber: messagetoInsert.receiverPhoneNumber,
            profilePicture: profileBase64,
            publicKey: remoteUser.publicKey,
          });
        }
      }
    }

    await upsertChatMetadata(
      messagetoInsert.senderPhoneNumber,
      messagetoInsert.receiverPhoneNumber,
      messagetoInsert.message,
      messagetoInsert.timestamp,
      messagetoInsert.status,
      isSenderCurrentUser,
    );

    const totalUnread = await getTotalUnreadCount(await getDBInstance());
    store.dispatch(setUnreadCount(totalUnread));
    store.dispatch(incrementTrigger());
  }
};

export const getMessagesByChatId = async (
  chatId: string,
  userPhoneNumber: string,
) => {
  const db = await getDBInstance();
  const conversationResult = await db.executeSql(
    'SELECT lastClearedAt FROM Conversations WHERE chatId = ? AND userPhoneNumber = ?',
    [chatId, userPhoneNumber],
  );

  let lastClearedAt = new Date(0).toISOString();

  if (
    conversationResult[0].rows.length > 0 &&
    conversationResult[0].rows.item(0).lastClearedAt
  ) {
    lastClearedAt = conversationResult[0].rows.item(0).lastClearedAt;
  }

  const result = await db.executeSql(
    'SELECT * FROM Messages WHERE chatId = ?AND timestamp > ?  ORDER BY timestamp ASC',
    [chatId, lastClearedAt],
  );

  const messages = [];
  for (let i = 0; i < result[0].rows.length; i++) {
    messages.push(result[0].rows.item(i));
  }
  return messages;
};

export const updateLocalMessageStatusToRead = async (details: {
  senderPhoneNumber: string;
  receiverPhoneNumber: string;
  previousStatus: string;
  currentStatus: string;
}): Promise<void> => {
  const db: SQLiteDatabase = await getDBInstance();
  const nonceArray = [];
  const query = `
    UPDATE Messages
    SET status = ?
    WHERE senderPhoneNumber = ? AND receiverPhoneNumber = ? AND status = ?
  `;
  const query2 = `
    SELECT * FROM Messages
    WHERE senderPhoneNumber = ? AND receiverPhoneNumber = ? AND status = ?
  `;
  const [result2] = await db.executeSql(query2, [
    details.senderPhoneNumber,
    details.receiverPhoneNumber,
    details.previousStatus,
  ]);
  await db.executeSql(query, [
    details.currentStatus,
    details.senderPhoneNumber,
    details.receiverPhoneNumber,
    details.previousStatus,
  ]);
  for (let i = 0; i < result2.rows.length; i++) {
    nonceArray.push(result2.rows.item(i).message);
  }
  sendUpdatedMessages({
    senderPhoneNumber: details.senderPhoneNumber,
    receiverPhoneNumber: details.receiverPhoneNumber,
    messages: nonceArray,
  });
};
export const updateSendMessageStatusToRead = async (details: {
  senderPhoneNumber: string;
  receiverPhoneNumber: string;
  messages: string[];
}): Promise<void> => {
  const db: SQLiteDatabase = await getDBInstance();
  const query = `
    UPDATE Messages
    SET status = ?
    WHERE senderPhoneNumber = ? AND receiverPhoneNumber = ? AND message = ?
  `;

  for (let i = 0; i < details.messages.length; i++) {
    await db.executeSql(query, [
      'read',
      details.senderPhoneNumber,
      details.receiverPhoneNumber,
      details.messages[i],
    ]);
    await updateChatMetadata(
      details.senderPhoneNumber,
      details.receiverPhoneNumber,
      details.messages[i],
      'read',
    );
  }
  const totalUnread = await getTotalUnreadCount(await getDBInstance());
  store.dispatch(setUnreadCount(totalUnread));
  store.dispatch(incrementTrigger());
};
export const updateSendMessageStatusToDelivered = async (details: {
  senderPhoneNumber: string;
  receiverPhoneNumber: string;
  messages: string[];
}): Promise<void> => {
  const db: SQLiteDatabase = await getDBInstance();
  const query = `
    UPDATE Messages
    SET status = ?
    WHERE senderPhoneNumber = ? AND receiverPhoneNumber = ? AND message = ?
  `;
  const status = 'delivered';
  for (let i = 0; i < details.messages.length; i++) {
    await db.executeSql(query, [
      status,
      details.senderPhoneNumber,
      details.receiverPhoneNumber,
      details.messages[i],
    ]);
    await updateChatMetadata(
      details.senderPhoneNumber,
      details.receiverPhoneNumber,
      details.messages[i],
      status,
    );
  }
  const totalUnread = await getTotalUnreadCount(await getDBInstance());
  store.dispatch(setUnreadCount(totalUnread));
  store.dispatch(incrementTrigger());
};
