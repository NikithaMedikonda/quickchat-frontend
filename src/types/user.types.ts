export type UserDetails = {
  name: string;
  profilePicture: string | null;
  phoneNumber: string;
  isBlocked: boolean;
  publicKey: string;
  onBlockStatusChange: (isBlocked: boolean) => void;
};
