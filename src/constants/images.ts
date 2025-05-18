import {useColorScheme, ImageSourcePropType} from 'react-native';
import WeChatLightLogo from '../assets/WeChatLightLogo.png';
import WeChatDarkLogo from '../assets/WeChatDarkLogo.png';
import TabMessageLight from '../assets/TabMessageLight.png';
import TabMessageDark from '../assets/TabMessageDark.png';
import TabUnreadDark from '../assets/TabUnreadDark.png';
import TabUnreadLight from '../assets/TabUnreadLight.png';
import TabProfileDark from '../assets/TabProfileDark.png';
import TabProfileLight from '../assets/TabProfileLight.png';
import HomeAddDark from '../assets/HomeAddDark.png';
import HomeAddLight from '../assets/HomeAddLight.png';
import ProfileDotsLight from '../assets/ProfileDotsLight.png';
import ProfileDotsDark from '../assets/ProfileDotsDark.png';
import BinDark from '../assets/BinDark.png';
import BinLight from '../assets/BinLight.png';
import PencilLight from '../assets/PencilLight.png';
import PencilDark from '../assets/PencilDark.png';
import LogoutDark from '../assets/LogoutDark.png';
import LogoutLight from '../assets/LogOutLight.png';

export const useImagesColors = (): {
  logo: ImageSourcePropType;
  tabHome: ImageSourcePropType;
  tabUnread: ImageSourcePropType;
  tabProfile: ImageSourcePropType;
  homeAdd: ImageSourcePropType;
  profileDots: ImageSourcePropType;
  bin: ImageSourcePropType;
  pencil: ImageSourcePropType;
  logoutImage: ImageSourcePropType;
} => {
  const scheme = useColorScheme();
  return {
    logo: scheme === 'dark' ? WeChatDarkLogo : WeChatLightLogo,
    tabHome: scheme === 'dark' ? TabMessageDark : TabMessageLight,
    tabUnread: scheme === 'dark' ? TabUnreadDark : TabUnreadLight,
    tabProfile: scheme === 'dark' ? TabProfileDark : TabProfileLight,
    homeAdd: scheme === 'dark' ? HomeAddLight : HomeAddDark,
    profileDots: scheme === 'dark' ? ProfileDotsDark : ProfileDotsLight,
    bin: scheme === 'dark' ? BinDark : BinLight,
    pencil: scheme === 'dark' ? PencilDark : PencilLight,
    logoutImage: scheme === 'dark' ? LogoutDark : LogoutLight,
  };
};
