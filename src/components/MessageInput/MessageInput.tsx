import { useState } from 'react';
import { Image, TextInput, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '../../themes/colors';
import { messageInputStyles } from './MessageInput.styles';

export const MessageInput = () => {
  const colors = useThemeColors();
  const styles = messageInputStyles(colors);
  const [inputText, setInputText] = useState('');
  return (
    <View style={styles.messageInput}>
      <TextInput
        placeholder="Type a message.."
        value={inputText}
        secureTextEntry={false}
        placeholderTextColor={styles.placeholder.color}
        onChangeText={(text: string) => setInputText(text)}
        style={styles.inputbox}
      />
      <TouchableOpacity>
        <Image
          source={require('../../assets/send-message-icon.png')}
          accessibilityHint="send-message-icon"
          style={styles.sendIcon}
        />
      </TouchableOpacity>
    </View>
  );
};
