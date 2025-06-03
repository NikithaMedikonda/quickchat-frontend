import { createChatId } from '../../utils/chatId';
import { getDBInstance } from '../connection/connection';
import { MessageType } from '../types/message';

export const insertToQueue = async (message: MessageType) => {
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
    'INSERT INTO Queue (id,chatId,senderPhoneNumber,receiverPhoneNumber,message,timestamp,status) VALUES (?,?, ?, ?, ?, ?,?)',
    [
      messagetoInsert.id,
      messagetoInsert.chatId,
      messagetoInsert.senderPhoneNumber,
      messagetoInsert.receiverPhoneNumber,
      messagetoInsert.message,
      messagetoInsert.timestamp,
      messagetoInsert.status,
    ],
  );
};

export const getQueuedMessages = async (chatId: string) => {
  const db = await getDBInstance();

  const [results] = await db.executeSql(
    'SELECT * FROM Queue WHERE chatId = ? ORDER BY timestamp ASC',
    [chatId],
  );

  const messages = [];
  for (let i = 0; i < results.rows.length; i++) {
    messages.push(results.rows.item(i));
  }
  return messages;
};

export const updateMessageStatus = async (message: MessageType) => {
  const db = await getDBInstance();
  await db.executeSql(
    'UPDATE Messages SET status = ?, message = ? WHERE id = ?',
    ['sent', message.message, message.id],
  );
};

export const deleteFromQueue = async (messageId: string) => {
  const db = await getDBInstance();
  await db.executeSql('DELETE FROM Queue WHERE id = ?', [messageId]);
};
