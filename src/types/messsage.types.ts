export type Message = {
  text: string;
  timestamp: string | Date;
  status: 'SENT' | 'DELIVERED' | 'READ';
};

export type SentMessageProps = {
  sentMessages: Message[];
};

export type ReceivedMessagetype = {
  text: string;
  timestamp: string;
};

export type ReceivedMessageProps = {
  receivedMessages: ReceivedMessagetype[];
};
export type SentPrivateMessage = {
  recipientPhoneNumber: string;
  message: string;
  senderPhoneNumber: string;
  timestamp: string;
  status: string;
};
export type ReceivePrivateMessage = {
  recipientPhoneNumber: string;
  message: string;
  senderPhoneNumber: string;
  timestamp: string;
};
export type Chats = {
  content: string;
  createdAt: string;
  status: string;
  sender: {
    phoneNumber: string;
  };
  receiver: {
    phoneNumber: string;
  };
};
export type AllMessages = {
  recipientPhoneNumber: string;
  message: string;
  senderPhoneNumber: string;
  timestamp: string;
  status?: string;
};
