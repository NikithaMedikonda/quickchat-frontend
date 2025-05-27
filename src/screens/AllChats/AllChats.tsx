import {useNavigation} from '@react-navigation/native';
import { useEffect, useLayoutEffect, useState} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {useDispatch} from 'react-redux';
import {useThemeColors} from '../../themes/colors';
import {HomeStackProps, HomeTabsProps} from '../../types/usenavigation.type';

import {ChatBox} from '../../components/ChatBox/ChatBox';
import {PlusIcon} from '../../components/PlusIcon/PlusIcon';
import {nameNumberIndex} from '../../helpers/nameNumberIndex';
import {normalise} from '../../helpers/normalisePhoneNumber';
import {getAllChats} from '../../services/GetAllChats';
import {hide, show} from '../../store/slices/loadingSlice';
import {
  setAlertMessage,
  setAlertTitle,
  setAlertType,
  setAlertVisible,
} from '../../store/slices/registrationSlice';
import {Home} from '../Home/Home';
import {getStyles} from './AllChats.styles';

export interface Chat {
  chatId: string;
  contactName: string | null;
  contactProfilePic: string | null;
  lastMessageStatus: 'sent' | 'delivered' | 'read';
  lastMessageText: string;
  lastMessageTimestamp: string;
  lastMessageType: 'sentMessage' | 'receivedMessage';
  phoneNumber: string;
  unreadCount: number;
}

export const AllChats = () => {
  const navigation = useNavigation<HomeTabsProps>();
  const homeStackNavigation = useNavigation<HomeStackProps>();
  const dispatch = useDispatch();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [chats, setChats] = useState<Chat[]>([]);
  const [contactName, setContactName] = useState<Record<string, string>>({});

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Quick Chat',
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTitleStyle: {
        color: colors.text,
      },
    });
  });

  useEffect(() => {
    const showAlert = (type: string, title: string, message: string) => {
      dispatch(setAlertType(type));
      dispatch(setAlertTitle(title));
      dispatch(setAlertMessage(message));
      dispatch(setAlertVisible(true));
    };

    const fetchChats = async () => {
      try {
        const phoneName = await nameNumberIndex();
        if (phoneName) {
          setContactName(phoneName);
        }
        dispatch(show());
        const response = await getAllChats();
        if (response.status === 200) {
          setChats(response.data.chats);
        }
        dispatch(hide());
      } catch (error) {
        dispatch(hide());
        showAlert(
          'info',
          'Network Connection',
          'Unable to fetch chats at this moment.',
        );
      }
    };
    fetchChats();
  }, [dispatch]);

  if (chats.length === 0) {
    return <Home />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatsContainer}>
        {chats.map(chat => (
          <TouchableOpacity
            key={chat.chatId}
            onPress={() =>
              homeStackNavigation.navigate('individualChat', {
                user: {
                  name:
                    contactName[normalise(chat.phoneNumber)] ||
                    chat.phoneNumber,
                  profilePicture: chat.contactProfilePic,
                  phoneNumber: chat.phoneNumber,
                },
              })
            }>
            <ChatBox
              image={chat.contactProfilePic}
              name={
                contactName[normalise(chat.phoneNumber)] || chat.phoneNumber
              }
              description={chat.lastMessageText}
              timestamp={chat.lastMessageTimestamp}
              unreadCount={chat.unreadCount}
              status={chat.lastMessageStatus}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.plusIcon}>
        <PlusIcon />
      </View>
    </View>
  );
};
