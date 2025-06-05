export const generateMessageId = (
  senderPhoneNumber: string,
  receiverPhoneNumber: string,
  timestamp: string,
) => {
  const random = Math.floor(Math.random() * 1000000);
  return `msg_${senderPhoneNumber}_${receiverPhoneNumber}_${timestamp}_${random}`;
};
