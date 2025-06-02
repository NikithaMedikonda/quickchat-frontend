import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import { getDevice } from 'react-native-device-info';
import { handleDeviceCheck } from '../services/SingleUserLogin';
import { InitialStackProps } from '../types/usenavigation.type';
import { useDispatch } from 'react-redux';
import {
  setAlertType,
  setAlertTitle,
  setAlertMessage,
  setAlertVisible,
} from '../store/slices/registrationSlice';

export const useDeviceCheck = () => {
  const navigation = useNavigation<InitialStackProps>();
  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
      const checkDevice = async () => {
        try {
          const userPhoneNumber = await EncryptedStorage.getItem('userPhoneNumber');
          const deviceId = await getDevice();

          if (userPhoneNumber && deviceId) {
            const isVerified = await handleDeviceCheck(userPhoneNumber, deviceId, navigation);

            if (!isVerified) {
              dispatch(setAlertType('error'));
              dispatch(setAlertTitle('Unverified Device'));
              dispatch(setAlertMessage('Your device is not verified. Please contact support.'));
              dispatch(setAlertVisible(true));
            }
          }
        } catch (error) {
          dispatch(setAlertType('error'));
          dispatch(setAlertTitle('Error'));
          dispatch(setAlertMessage('Device check failed. Please try again later.'));
          dispatch(setAlertVisible(true));
        }
      };

      checkDevice();
    }, [navigation, dispatch])
  );
};
