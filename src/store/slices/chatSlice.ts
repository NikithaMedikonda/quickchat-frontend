import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    trigger: 0,
  },
  reducers: {
    incrementTrigger(state: { trigger: number; }) {
      state.trigger += 1;
    },
  },
});

export const {incrementTrigger} = chatSlice.actions;
export const chatReducer = chatSlice.reducer;
