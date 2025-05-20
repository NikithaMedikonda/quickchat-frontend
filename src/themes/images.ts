import { ImageSourcePropType} from 'react-native';
import QuickChatDarkLogo from '../assets/QuickChatDarkLogo.png';
import TabMessageDark from '../assets/TabMessageDark.png';
import TabUnreadDark from '../assets/TabUnreadDark.png';
import TabProfileDark from '../assets/TabProfileDark.png';
import HomeAddDark from '../assets/HomeAddDark.png';
import ProfileDotsDark from '../assets/ProfileDotsDark.png';
import BinDark from '../assets/BinDark.png';
import PencilDark from '../assets/PencilDark.png';
import LogoutDark from '../assets/LogoutDark.png';
import chatblockDark from '../assets/chatblockDark.png';

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
  chatblockImage: ImageSourcePropType;
} => {
  return {
    logo:  QuickChatDarkLogo ,
    tabHome:  TabMessageDark ,
    tabUnread:  TabUnreadDark,
    tabProfile:  TabProfileDark ,
    homeAdd:   HomeAddDark,
    profileDots:  ProfileDotsDark ,
    bin:  BinDark ,
    pencil:  PencilDark ,
    logoutImage:  LogoutDark,
    chatblockImage : chatblockDark
  };
};
