export type UserDetails = {
  name: string;
  profilePicture: string;
  phoneNumber: string;
  isBlocked:boolean
  onBlockStatusChange: (isBlocked: boolean) => void;
};
