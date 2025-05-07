import { configureStore } from '@reduxjs/toolkit';
import loadingReducer from './slices/loadingSlice';
import registrationReducer from './slices/registrationSlice';

export const store = configureStore({
  reducer: {
    loading: loadingReducer,
    registration: registrationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
