import {useRef, useState} from 'react';
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
  const [_force, forceUpdate] = useState(0);

  const inputTextRef = useRef<string>('');
  const {t} = useTranslation('auth');
  return (
    <View style={styles.messageInput}>
      <TextInput
        placeholder={t('Type a message..')}
        value={inputTextRef.current}
        secureTextEntry={false}
        placeholderTextColor={styles.placeholder.color}
        onChangeText={(text: string) => {
          inputTextRef.current = text;
          forceUpdate(n => n + 1);
        }}
        style={styles.inputBox}
        multiline
        numberOfLines={5}
      />
      <TouchableOpacity
        onPress={() => {
          setMessage(inputTextRef.current);
          inputTextRef.current = '';
          forceUpdate(n => n + 1);
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
