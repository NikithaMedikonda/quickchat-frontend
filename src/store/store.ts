import { configureStore } from '@reduxjs/toolkit';
import { loadingReducer } from './slices/loadingSlice';
import { loginReducer } from './slices/loginSlice';
import {registrationReducer} from './slices/registrationSlice';

export const store = configureStore({
  reducer: {
    loading: loadingReducer,
    registration: registrationReducer,
    login:loginReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
