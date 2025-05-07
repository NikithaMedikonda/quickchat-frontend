import { configureStore } from '@reduxjs/toolkit';
import { loadingReducer } from './loading/loading.reducer';

export const store = configureStore({
  reducer: {
    loading: loadingReducer,
  },
});

