export type UserDetails = {
  name: string;
  profilePicture: string | null;
  phoneNumber: string;
  isBlocked:boolean
  onBlockStatusChange: (isBlocked: boolean) => void;
};
