import {createChatId} from '../../utils/chatId';
import {getDBInstance} from '../connection/connection';

// export const insertToLocalDB = async (chats: any, phoneNumber: string) => {
//   for (const chat of chats) {
//     const db = await getDBInstance();
//     if (chat.Messages && chat.Messages.length > 0) {
//       await db.executeSql(
//         `INSERT OR REPLACE INTO Chats (id, userAPhoneNumber, userBPhoneNumber, lastMessage, lastMessageTimestamp, lastMessageType, lastMessageStatus, unReadCount, lastSyncedAt)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           createChatId(chat.userA.phoneNumber, chat.userB.phoneNumber),
//           chat.userA.phoneNumber,
//           chat.userB.phoneNumber,
//           chat.Messages.at(-1).content,
//           chat.Messages.at(-1).createdAt,
//           chat.Messages.at(-1).sender.phoneNumber === phoneNumber
//             ? 'sent'
//             : 'received',
//           chat.Messages.at(-1).status,
//           chat.unreadCount || 0,
//           new Date().toISOString(),
//         ],
//       );

//       for (const participant of [chat.userA, chat.userB]) {
//         await db.executeSql(
//           `
//       INSERT OR REPLACE INTO LocalUsers (phoneNumber, name, profilePicture, publicKey)
//       VALUES (?, ?, ?, ?)`,
//           [
//             participant.phoneNumber,
//             `${participant.firstName} ${participant.lastName}`,
//             participant.profilePicture,
//             participant.publicKey,
//           ],
//         );
//       }

//       for (const msg of chat.Messages) {
//         await db.executeSql(
//           `
//       INSERT OR REPLACE INTO Messages (id, chatId, senderPhoneNumber, receiverPhoneNumber, message, status, timestamp)
//       VALUES (?, ?, ?, ?, ?, ?, ?)`,
//           [
//             msg.id,
//             createChatId(chat.userA.phoneNumber, chat.userB.phoneNumber),
//             msg.sender.phoneNumber,
//             msg.receiver.phoneNumber,
//             msg.content,
//             msg.status,
//             msg.createdAt,
//           ],
//         );
//       }

//       const conversation = chat.Conversations[0];
//       await db.executeSql(
//         `INSERT INTO Conversations (chatId, userPhoneNumber, isDeleted, lastClearedAt)
//         VALUES (?, ?, ?, ?)`,
//         [
//           createChatId(chat.userA.phoneNumber, chat.userB.phoneNumber),
//           phoneNumber,
//           conversation ? (conversation.isDeleted ? 1 : 0) : 0,
//           conversation ? conversation.lastClearedAt : null,
//         ],
//       );
//     }
//   }
// };
export const insertToLocalDB = async (chats: any, phoneNumber: string) => {
  for (const chat of chats) {
    const db = await getDBInstance();
    if (chat.Messages && chat.Messages.length > 0) {
      const conversation = chat.Conversations[0];
      console.log(
        'conversation',
        conversation,
        conversation.lastClearedAt,
        chat.Messages.at(-1).createdAt > conversation.lastClearedAt,
      );
      if (conversation.lastClearedAt === null) {
        await db.executeSql(
          `INSERT OR REPLACE INTO Chats (id, userAPhoneNumber, userBPhoneNumber, lastMessage, lastMessageTimestamp, lastMessageType, lastMessageStatus, unReadCount, lastSyncedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            createChatId(chat.userA.phoneNumber, chat.userB.phoneNumber),
            chat.userA.phoneNumber,
            chat.userB.phoneNumber,
            chat.Messages.at(-1).content,
            chat.Messages.at(-1).createdAt,
            chat.Messages.at(-1).sender.phoneNumber === phoneNumber
              ? 'sent'
              : 'received',
            chat.Messages.at(-1).status,
            chat.unreadCount || 0,
            new Date().toISOString(),
          ],
        );
      } else if (chat.Messages.at(-1).createdAt > conversation.lastClearedAt) {
        await db.executeSql(
          `INSERT OR REPLACE INTO Chats (id, userAPhoneNumber, userBPhoneNumber, lastMessage, lastMessageTimestamp, lastMessageType, lastMessageStatus, unReadCount, lastSyncedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            createChatId(chat.userA.phoneNumber, chat.userB.phoneNumber),
            chat.userA.phoneNumber,
            chat.userB.phoneNumber,
            chat.Messages.at(-1).content,
            chat.Messages.at(-1).createdAt,
            chat.Messages.at(-1).sender.phoneNumber === phoneNumber
              ? 'sent'
              : 'received',
            chat.Messages.at(-1).status,
            chat.unreadCount || 0,
            new Date().toISOString(),
          ],
        );
      }

      for (const participant of [chat.userA, chat.userB]) {
        await db.executeSql(
          `
      INSERT OR REPLACE INTO LocalUsers (phoneNumber, name, profilePicture, publicKey)
      VALUES (?, ?, ?, ?)`,
          [
            participant.phoneNumber,
            `${participant.firstName} ${participant.lastName}`,
            participant.profilePicture,
            participant.publicKey,
          ],
        );
      }

      for (const msg of chat.Messages) {
        await db.executeSql(
          `
      INSERT OR REPLACE INTO Messages (id, chatId, senderPhoneNumber, receiverPhoneNumber, message, status, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            msg.id,
            createChatId(chat.userA.phoneNumber, chat.userB.phoneNumber),
            msg.sender.phoneNumber,
            msg.receiver.phoneNumber,
            msg.content,
            msg.status,
            msg.createdAt,
          ],
        );
      }

      await db.executeSql(
        `INSERT INTO Conversations (chatId, userPhoneNumber, isDeleted, lastClearedAt)
        VALUES (?, ?, ?, ?)`,
        [
          createChatId(chat.userA.phoneNumber, chat.userB.phoneNumber),
          phoneNumber,
          conversation ? (conversation.isDeleted ? 1 : 0) : 0,
          conversation ? conversation.lastClearedAt : null,
        ],
      );
    }
  }
};
