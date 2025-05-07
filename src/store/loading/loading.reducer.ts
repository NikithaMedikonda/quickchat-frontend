import { createReducer } from '@reduxjs/toolkit';
import { hide, show } from './loading.actions';
import { LoadingState } from './LoadingState';

const initialState: LoadingState = {
  show: true,
};

export const loadingReducer = createReducer(initialState, builder => {
  builder
    .addCase(show, () => ({ show: true }))
    .addCase(hide, () => ({ show: false }));
});
