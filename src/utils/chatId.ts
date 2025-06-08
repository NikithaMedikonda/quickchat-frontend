export const createChatId = (phoneNumberA: string, phoneNumberB: string) => {
  return [phoneNumberA, phoneNumberB].sort().join('_');
};
