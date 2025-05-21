export type Message = {
  text: string;
  timestamp: string | Date ;
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
