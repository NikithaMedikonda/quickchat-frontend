import React from 'react';
import {View, Text, Modal, Image, TouchableOpacity} from 'react-native';
import {styles} from './CustomeAlert.style';
import {AlerTypes} from '../../types/alert.types';
import {setAlertVisible} from '../../store/slices/registrationSlice';
import {useDispatch, useSelector} from 'react-redux';
import warningImage from '../../assets/warning-2.png';
import errorImage from '../../assets/cross-3.png';
import successImage from '../../assets/check.png';
import infoImage from '../../assets/information-2.png';
import { RootState } from '../../store/store';
export const CustomAlert = ({ type, title, message}: AlerTypes) => {
  const dispatch = useDispatch();
   const {alertVisible} = useSelector(
    (state: RootState) => state.registration,
  );
  const onConfirm = () => {
    dispatch(setAlertVisible(false));
  };
  const getIconByType = (type:string) => {
  switch (type) {
    case 'success':
      return successImage;
    case 'warning':
      return warningImage;
    case 'error':
      return errorImage;
    case 'info':
      return infoImage;
    default:
      return infoImage;
  }
};

  return (
    <Modal transparent visible={alertVisible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <Image source={getIconByType(type)} style={styles.icon} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          {type !== 'success' && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.okButton} onPress={onConfirm}>
                <Text style={styles.okText}>OK</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
