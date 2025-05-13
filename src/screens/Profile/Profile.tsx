import {Text, View, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ProfileScreenNavigationProp} from '../../types/usenavigation.type';

export const Profile = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const goToEditProfile = () => {
    navigation.navigate('editProfile');
  };
  return (
    <View>
      <Text>Hello profile</Text>
      <TouchableOpacity onPress={goToEditProfile}>
        <Text>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
};
