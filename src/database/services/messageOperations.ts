import { createChatId } from '../../utils/chatId';
import { getDBInstance } from '../connection/connection';
import { MessageType } from '../types/message';

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
