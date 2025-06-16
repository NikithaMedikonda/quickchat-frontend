import { chatReducer, incrementTrigger } from '../slices/chatSlice';

describe('chatSlice', () => {
  it('should return the initial state', () => {
    expect(chatReducer(undefined, {type: ''})).toEqual({trigger: 0});
  });

  it('should increment trigger when incrementTrigger is dispatched', () => {
    const initialState = {trigger: 0};
    const nextState = chatReducer(initialState, incrementTrigger());
    expect(nextState.trigger).toBe(1);
  });

  it('should increment trigger multiple times', () => {
    let state = {trigger: 0};
    state = chatReducer(state, incrementTrigger());
    state = chatReducer(state, incrementTrigger());
    expect(state.trigger).toBe(2);
  });
});
