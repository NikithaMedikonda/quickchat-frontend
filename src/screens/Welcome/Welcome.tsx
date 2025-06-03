import {View, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button} from '../../components/Button/Button.tsx';
import {getStyles} from './Welcome.styles.ts';
import {NavigationProps} from '../../types/usenavigation.type.ts';
import {useImagesColors} from '../../themes/images.ts';
import {useThemeColors} from '../../themes/colors.ts';
import {useDeviceCheck} from '../../services/useDeviceCheck.tsx';
import {CustomAlert} from '../../components/CustomAlert/CustomAlert.tsx';
import {RootState} from '../../store/store.ts';
import {useSelector} from 'react-redux';
export const Welcome = () => {
  useDeviceCheck();
  const {alertType, alertTitle, alertMessage} = useSelector(
    (state: RootState) => state.registration,
  );
  const navigation = useNavigation<NavigationProps>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const {logo} = useImagesColors();

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={logo}
          accessibilityHint="logo-image"
        />
      </View>
      <View>
        <Button
          title="Get Started"
          onPress={() => navigation.navigate('register')}
        />
      </View>
      <CustomAlert type={alertType} title={alertTitle} message={alertMessage} />
    </View>
  );
};
