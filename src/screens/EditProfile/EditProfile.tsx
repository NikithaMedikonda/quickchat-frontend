import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../../store/store';
import {useThemeColors} from '../../constants/colors';
import {getStyles} from './EditProfile.styles';
import {Placeholder} from '../../components/InputField/InputField';
import {ImagePickerModal} from '../../components/ImagePickerModal/ImagePickerModal';
import {setIsVisible} from '../../store/slices/registrationSlice';

export const EditProfile = () => {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const {t} = useTranslation(['home', 'auth']);
  const dispatch = useDispatch();

  const {imageUri} = useSelector((state: RootState) => state.registration);

  const user = useSelector((state: any) => state.login.user);

  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
  const email = user?.email || '';

  const [inputFirstName, setInputFirstName] = useState(firstName);
  const [inputLastName, setInputLastName] = useState(lastName);
  const [inputEmail, setInputEmail] = useState(email);

  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitleAlign: 'center',
      HeaderTitle: 'Edit Profile',
    });
  }, []);

  useEffect(() => {
    setInputFirstName(firstName);
    setInputLastName(lastName);
    setInputEmail(email);
  }, [firstName, lastName, email, imageUri]);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    if (!inputFirstName) {
      Alert.alert('Error', 'First name is required');
      return false;
    }
    if (!inputLastName) {
      Alert.alert('Error', 'Last name is required');
      return false;
    }
    if (inputEmail && !validateEmail(inputEmail)) {
      Alert.alert('Error', 'Invalid email format');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (validateForm()) {
    }
  };

  const handleCancel = () => {
    setInputFirstName(firstName);
    setInputLastName(lastName);
    setInputEmail(email);
  };

  const inputFields = [
    {
      key: 'firstName',
      label: 'First Name',
      value: inputFirstName,
      setter: setInputFirstName,
    },
    {
      key: 'lastName',
      label: 'Last Name',
      value: inputLastName,
      setter: setInputLastName,
    },
    {key: 'email', label: 'Email', value: inputEmail, setter: setInputEmail},
  ];

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          onPress={() => dispatch(setIsVisible(true))}
          accessibilityRole="button">
          <Image
            source={
              imageUri ? {uri: imageUri} : require('../../assets/image.png')
            }
            accessibilityRole="button"
            style={styles.profileImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {inputFields.map(field => (
          <View key={field.key} style={styles.fieldContainer}>
            <Text style={styles.label}>{t(field.label)}</Text>
            <Placeholder
              title={field.label}
              value={field.value}
              onChange={text => field.setter(text)}
              secureTextEntry={false}
            />
          </View>
        ))}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.touchableButton} onPress={handleSave}>
            <Text style={styles.buttonText}>{t('Save')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.touchableButton}
            onPress={handleCancel}>
            <Text style={styles.buttonText}>{t('Cancel')}</Text>
          </TouchableOpacity>
        </View>

        <ImagePickerModal />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
