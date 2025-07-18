import { createChatId } from '../../utils/chatId';
import { getDBInstance } from '../connection/connection';
import { MessageType } from '../types/message';
import { upsertChatMetadata } from './chatOperations';

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

export const updateLocalMessageStatus = async (message: MessageType) => {
  const db = await getDBInstance();
  await db.executeSql(
    'UPDATE Messages SET status = ?, message = ? WHERE id = ?',
    [message.status, message.message, message.id],
  );
  await upsertChatMetadata(
    message.senderPhoneNumber,
    message.receiverPhoneNumber,
    message.message,
    message.timestamp,
    message.status,
    true,
  );
};

export const deleteFromQueue = async (messageId: string) => {
  const db = await getDBInstance();
  await db.executeSql('DELETE FROM Queue WHERE id = ?', [messageId]);
};

export const getAllQueuedMessages = async () => {
  const db = await getDBInstance();

  const [results] = await db.executeSql(
    'SELECT * FROM Queue ORDER BY timestamp ASC',
  );

  const messages = [];
  for (let i = 0; i < results.rows.length; i++) {
    messages.push(results.rows.item(i));
  }
  return messages;
};
