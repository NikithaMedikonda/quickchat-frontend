import {
    resetScreenContext,
    screenContextReducer,
    setCurrentScreen,
    setIndividualChatStatus,
} from '../slices/screenContextSlice';

describe('screenContextSlice', () => {
  const initialState = {
    currentScreen: 'home',
    isInIndividualChat: false,
    shouldProcessGlobalQueue: true,
  };

  it('should handle setCurrentScreen to "individualChat"', () => {
    const nextState = screenContextReducer(
      initialState,
      setCurrentScreen('individualChat'),
    );
    expect(nextState.currentScreen).toBe('individualChat');
    expect(nextState.isInIndividualChat).toBe(true);
    expect(nextState.shouldProcessGlobalQueue).toBe(false);
  });

  it('should handle setCurrentScreen to any non-chat screen (e.g. "home")', () => {
    const modifiedState = {
      currentScreen: 'individualChat',
      isInIndividualChat: true,
      shouldProcessGlobalQueue: false,
    };

    const nextState = screenContextReducer(
      modifiedState,
      setCurrentScreen('home'),
    );
    expect(nextState.currentScreen).toBe('home');
    expect(nextState.isInIndividualChat).toBe(false);
    expect(nextState.shouldProcessGlobalQueue).toBe(true);
  });

  it('should handle setIndividualChatStatus to true', () => {
    const nextState = screenContextReducer(
      initialState,
      setIndividualChatStatus(true),
    );
    expect(nextState.isInIndividualChat).toBe(true);
    expect(nextState.shouldProcessGlobalQueue).toBe(false);
  });

  it('should handle setIndividualChatStatus to false', () => {
    const modifiedState = {
      currentScreen: 'individualChat',
      isInIndividualChat: true,
      shouldProcessGlobalQueue: false,
    };

    const nextState = screenContextReducer(
      modifiedState,
      setIndividualChatStatus(false),
    );
    expect(nextState.isInIndividualChat).toBe(false);
    expect(nextState.shouldProcessGlobalQueue).toBe(true);
  });

  it('should reset the screen context to initial values', () => {
    const modifiedState = {
      currentScreen: 'profile',
      isInIndividualChat: true,
      shouldProcessGlobalQueue: false,
    };

    const nextState = screenContextReducer(modifiedState, resetScreenContext());
    expect(nextState).toEqual(initialState);
  });
});
