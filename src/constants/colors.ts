import {useColorScheme} from 'react-native';
export const useThemeColors = () => {
  const scheme = useColorScheme();
  return {
    primaryBlue: '#1877F2',
    gray: '#898989',
    background: scheme === 'dark' ? '#000000' : '#FFFFFF',
    text: scheme === 'dark' ? '#FFFFFF' : '#000000',
    placeholder: scheme === 'dark' ? '#FFFFFF' : '#D3D3D3',
    profileOptionsText: scheme === 'dark' ? '#000000' : '#FFFFFF',
  };
};

export type Colors = {
  primaryBlue: string;
  gray: string;
  background: string;
  text: string;
  placeholder: string;
  profileOptionsText: string;
};
