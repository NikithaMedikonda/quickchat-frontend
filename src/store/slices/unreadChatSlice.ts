import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UnreadState {
  count: number;
}

const initialState: UnreadState = { count: 0 };

const unreadChatSlice = createSlice({
  name: 'unread',
  initialState,
  reducers: {
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    incrementUnread: (state) => {
      state.count += 1;
    },
    decrementUnread: (state) => {
      if (state.count > 0) { state.count -= 1; }
    },
    resetUnread: (state) => {
      state.count = 0;
    },
  },
});

export const {
  setUnreadCount,
  incrementUnread,
  decrementUnread,
  resetUnread,
} = unreadChatSlice.actions;

export const unreadChatReducer = unreadChatSlice.reducer;
