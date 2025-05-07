import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSelector } from 'react-redux';
import { LoadingState } from '../../store/loading/LoadingState';
import { loadingComponentStyles } from './LoadingComponent.styles';

const LoadingComponent = () => {
  const loadingState = useSelector((state: { loading: LoadingState }) => state.loading);

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

export default LoadingComponent;
