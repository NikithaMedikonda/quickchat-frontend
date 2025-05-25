import {useState} from 'react';
import {Image, TextInput, TouchableOpacity, View} from 'react-native';

import {useTranslation} from 'react-i18next';
import {useThemeColors} from '../../themes/colors';
import {messageInputStyles} from './MessageInput.styles';

export const MessageInput = ({
  setMessage,
}: {
  setMessage: (message: string) => void;
}) => {
  const colors = useThemeColors();
  const styles = messageInputStyles(colors);
  const [inputText, setInputText] = useState('');
  const {t} = useTranslation('auth');
  return (
    <View style={styles.messageInput}>
      <TextInput
        placeholder={t('Type a message..')}
        value={inputText}
        secureTextEntry={false}
        placeholderTextColor={styles.placeholder.color}
        onChangeText={(text: string) => setInputText(text)}
        style={styles.inputBox}
        multiline
      />
      <TouchableOpacity
        onPress={() => {
          setMessage(inputText);
          setInputText('');
        }}>
        <Image
          source={require('../../assets/send-message-icon.png')}
          accessibilityHint="send-message-icon"
          style={styles.sendIcon}
        />
      </TouchableOpacity>
    </View>
  );
};
