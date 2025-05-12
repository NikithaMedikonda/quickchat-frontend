import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react-native';
import { loadingReducer } from '../../store/slices/loadingSlice';
import { LoadingComponent } from './Loading';

const renderWithRedux = (initialState: any) => {
  const store = configureStore({
    reducer: { loading: loadingReducer },
    preloadedState: { loading: initialState },
  });

  return render(
    <Provider store={store}>
      <LoadingComponent />
    </Provider>
  );
};

describe('LoadingComponent', () => {
  it('should render ActivityIndicator when loading.show is true', () => {
    const { getByTestId } = renderWithRedux({ show: true });

    const spinner = getByTestId('loading-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should not render anything when loading.show is false', () => {
    const { queryByTestId } = renderWithRedux({ show: false });

    const spinner = queryByTestId('loading-spinner');
    expect(spinner).toBeNull();
  });
});
