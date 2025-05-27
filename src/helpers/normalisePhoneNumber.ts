export const normalise = (phoneNumber: string) => {
  return phoneNumber.replace(/[\s()-]/g, '').replace(/^0/, '');
};
