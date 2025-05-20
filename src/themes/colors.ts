export const useThemeColors = () => {
  return {
    primaryBlue: '#1877F2',
    gray: '#898989',
    background:  '#000000' ,
    text:  '#FFFFFF' ,
    placeholder:  '#FFFFFF' ,
    profileOptionsText:  '#000000',
    buttonText :  '#000000' ,
    inputText : '#000000',
    modalOverlayBackground : 'rgba(0, 0, 0, 0.6)',
  };
};

export type Colors = {
  primaryBlue: string;
  gray: string;
  background: string;
  text: string;
  placeholder: string;
  profileOptionsText: string;
  buttonText:string;
  inputText: string;
  modalOverlayBackground: string;
};
