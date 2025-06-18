import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface ScreenContextState {
  currentScreen: string;
  isInIndividualChat: boolean;
  shouldProcessGlobalQueue: boolean;
}

const initialState: ScreenContextState = {
  currentScreen: 'home',
  isInIndividualChat: false,
  shouldProcessGlobalQueue: true,
};

const screenContextSlice = createSlice({
  name: 'screenContext',
  initialState,
  reducers: {
    setCurrentScreen: (state, action: PayloadAction<string>) => {
      state.currentScreen = action.payload;
      state.isInIndividualChat = action.payload === 'individualChat';
      state.shouldProcessGlobalQueue = action.payload !== 'individualChat';
    },
    setIndividualChatStatus: (state, action: PayloadAction<boolean>) => {
      state.isInIndividualChat = action.payload;
      state.shouldProcessGlobalQueue = !action.payload;
    },
    resetScreenContext: state => {
      state.currentScreen = 'home';
      state.isInIndividualChat = false;
      state.shouldProcessGlobalQueue = true;
    },
  },
});

export const {setCurrentScreen, setIndividualChatStatus, resetScreenContext} =
  screenContextSlice.actions;

export const screenContextReducer = screenContextSlice.reducer;
