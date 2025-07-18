import { ActivityIndicator, View } from 'react-native';
import { useSelector } from 'react-redux';
import { loadingComponentStyles } from './Loading.styles';
import { RootState } from '../../store/store';


export const LoadingComponent = () => {
  const loadingState = useSelector((state: RootState) => state.loading);

  if (!loadingState.show) {
    return null;
  }

  return (
    <View style={loadingComponentStyles.backdrop}>
      <ActivityIndicator
        testID="loading-spinner"
        animating={true}
        color={loadingComponentStyles.spinner.color}
        size="large" />
    </View>
  );
};

