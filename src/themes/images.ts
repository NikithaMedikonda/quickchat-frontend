import {ImageSourcePropType} from 'react-native';
import AndroidBackArrowDark from '../assets/AndroidBackArrowDark.png';
import chatblockLight from '../assets/chatblockLight.png';
import BinLight from '../assets/BinLight.png'
import HomeAddDark from '../assets/HomeAddDark.png';
import IOSBackArrowDark from '../assets/IOSBackArrowDark.png';
import LogoutDark from '../assets/LogoutDark.png';
import PencilDark from '../assets/PencilDark.png';
import ProfileDotsDark from '../assets/ProfileDotsDark.png';
import QuickChatDarkLogo from '../assets/QuickChatDarkLogo.png';
import TabMessageDark from '../assets/TabMessageDark.png';
import TabProfileDark from '../assets/TabProfileDark.png';
import TabUnreadDark from '../assets/TabUnreadDark.png';


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
  androidBackArrow: ImageSourcePropType;
  iOSBackArrow: ImageSourcePropType;
} => {
  return {
    logo: QuickChatDarkLogo,
    tabHome: TabMessageDark,
    tabUnread: TabUnreadDark,
    tabProfile: TabProfileDark,
    homeAdd: HomeAddDark,
    profileDots: ProfileDotsDark,
    bin: BinLight,
    pencil: PencilDark,
    logoutImage: LogoutDark,
    chatblockImage: chatblockLight,
    androidBackArrow: AndroidBackArrowDark,
    iOSBackArrow: IOSBackArrowDark,
  };
};
