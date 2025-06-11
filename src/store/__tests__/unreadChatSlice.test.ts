import {
  decrementUnread,
  incrementUnread,
  newMessageCount,
  resetUnread,
  setNewMessageCount,
  setUnreadCount,
  unreadChatReducer,
} from '../slices/unreadChatSlice';

describe('unreadChatSlice reducer', () => {
  it('should return the initial state when passed an unknown action', () => {
    const initialState = {count: 0, msgCount: 0};
    const action = {type: 'unknown'};
    const result = unreadChatReducer(undefined, action);
    expect(result).toEqual(initialState);
  });

  it('should handle setUnreadCount', () => {
    const result = unreadChatReducer(
      {count: 0, msgCount: 0},
      setUnreadCount(7),
    );
    expect(result.count).toBe(7);
  });

  it('should handle incrementUnread', () => {
    const result = unreadChatReducer(
      {count: 2, msgCount: 0},
      incrementUnread(),
    );
    expect(result.count).toBe(3);
  });

  it('should handle decrementUnread when count > 0', () => {
    const result = unreadChatReducer(
      {count: 4, msgCount: 0},
      decrementUnread(),
    );
    expect(result.count).toBe(3);
  });

  it('should not decrement when count is 0', () => {
    const result = unreadChatReducer(
      {count: 0, msgCount: 0},
      decrementUnread(),
    );
    expect(result.count).toBe(0);
  });

  it('should handle resetUnread', () => {
    const result = unreadChatReducer({count: 10, msgCount: 0}, resetUnread());
    expect(result.count).toBe(0);
  });

  it('should not allow count to go below 0 with multiple decrements', () => {
    let state = {count: 1, msgCount: 0};
    state = unreadChatReducer(state, decrementUnread());
    state = unreadChatReducer(state, decrementUnread());
    expect(state.count).toBe(0);
  });

  it('should handle setNewMessageCount', () => {
    const result = unreadChatReducer(
      {count: 0, msgCount: 2},
      setNewMessageCount(4),
    );
    expect(result.msgCount).toBe(4);
  });

  it('should handle newMessageCount (increment msgCount)', () => {
    const result = unreadChatReducer(
      {count: 0, msgCount: 3},
      newMessageCount(),
    );
    expect(result.msgCount).toBe(4);
  });
});
