import  { show, hide } from '../slices/loadingSlice';
import { loadingReducer } from '../slices/loadingSlice';

describe('loadingSlice', () => {
  const initialState = { show: false };

  it('should return the initial state', () => {
    expect(loadingReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('should handle show action', () => {
    const nextState = loadingReducer(initialState, show());
    expect(nextState).toEqual({ show: true });
  });

  it('should handle hide action', () => {
    const currentState = { show: true };
    const nextState = loadingReducer(currentState, hide());
    expect(nextState).toEqual({ show: false });
  });
});
