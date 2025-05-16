import {
  View,
  Text,
  Platform,
  Image,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {Placeholder} from '../../components/InputField/InputField';
import {useThemeColors} from '../../constants/colors';
import {TimeStamp} from '../../components/TimeStamp/TimeStamp';
import {individualChatstyles} from './IndividualChat.styles';
import {useState} from 'react';


export const IndividualChat = ({
  receivedMessage,
}: {
  receivedMessage: String;
}) => {

  const [inputText, setInputText] = useState('');
  const [sentMessages, setSentMessages] = useState<string[]>([]);
  const colors = useThemeColors();
  const styles = individualChatstyles(colors);
  const MessageStatus: {[key: string]: any} = {
    SENT: require('../../assets/single-tick.png'),
    DELIVERED: require('../../assets/double-ticks.png'),
    READ: require('../../assets/blue-ticks.png'),
  };
  const sentMessageStatus = 'DELIVERED';
  const sendMessage = () => {
    if (inputText.trim() === ''){
      return null;
    }
    setSentMessages(previousMessages => [...previousMessages, inputText]);
    setInputText('');
  };
  return (
     <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <Image
          source={
            Platform.OS === 'ios'
              ? require('../../assets/ios-return-icon.png')
              : require('../../assets/return-icon.png')
          }
          accessibilityHint="return-icon"
          style={styles.backIcon}
        />
        <Image
           source={require('../../assets/profile-image.png')}
          accessibilityHint="user-profile-avatar"
          style={styles.profileImage}
        />
        <Text style={styles.usernameText}>Usha</Text>
        <Image
          source={require('../../assets/dots.png')}
          accessibilityHint="more-options-icon"
          style={styles.moreOptionsIcon}
        />
      </View>
      <ScrollView>
        <View style={styles.receivedMessageContainer}>
          <Text style={styles.receivedMessageText}>{receivedMessage}</Text>
          <TimeStamp messageTime={'2025-05-15T10:15:00'} />
        </View>
        {sentMessages.map((message, index) => (
          <View key={index} style={styles.sentMessageContainer}>
            <Text style={styles.sentMessageText}>{message}</Text>
            <TimeStamp messageTime={'2025-05-15T12:15:00'} />
            <Image
              source={MessageStatus[sentMessageStatus]}
              style={styles.tickIcon}
              accessibilityHint="sent-tick"
            />
          </View>
        ))}
      </ScrollView>
      <View style={styles.messageInput}>
        <Placeholder
          title="Type a message.."
          value={inputText}
          secureTextEntry={false}
          onChange={(text: string) => setInputText(text)}
        />
        <TouchableOpacity onPress={sendMessage}>
          <Image
            source={require('../../assets/send-button.png')}
            accessibilityHint="send-message-icon"
            style={styles.sendIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};
