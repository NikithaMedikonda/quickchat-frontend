import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useCallback} from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import {InitialStackProps} from '../types/usenavigation.type';
import {useDispatch, useSelector} from 'react-redux';
import {
  setAlertVisible,
  setAlertType,
  setAlertTitle,
  setAlertMessage,
} from '../store/slices/registrationSlice';
import {checkDeviceStatus} from '../socket/socket';
import {getDeviceId} from './GenerateDeviceId';
import {CustomAlert} from '../components/CustomAlert/CustomAlert';
import {RootState} from '../store/store';

export const useDeviceCheck = () => {
  const navigation = useNavigation<InitialStackProps>();
  const dispatch = useDispatch();
  const {alertType, alertTitle, alertMessage} = useSelector(
    (state: RootState) => state.registration,
  );
  const showAlert = useCallback(
    (type: string, title: string, message: string) => {
      dispatch(setAlertType(type));
      dispatch(setAlertTitle(title));
      dispatch(setAlertMessage(message));
      dispatch(setAlertVisible(true));
    },
    [dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      const checkDevice = async () => {
        const user = await EncryptedStorage.getItem('user');
        const userData = user ? JSON.parse(user) : {};
        const userPhoneNumber = userData.phoneNumber;
        const deviceId = await getDeviceId();
        if (userPhoneNumber && deviceId) {
          const result = await checkDeviceStatus(userPhoneNumber, deviceId);
          if (!result.success && result.action === 'logout') {
            showAlert(
              'error',
              'Device Mismatch',
              'You have logged in from another device.',
            );
            dispatch(setAlertVisible(true));
            setTimeout(async () => {
              await EncryptedStorage.clear();
              navigation.replace('welcome');
            }, 1);
          }
        }
      };

      checkDevice();
    }, [dispatch, navigation, showAlert]),
  );
  return (
    <CustomAlert type={alertType} title={alertTitle} message={alertMessage} />
  );
};
