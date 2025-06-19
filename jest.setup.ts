// import { act } from '@testing-library/react-native';
// jest.useFakeTimers({ legacyFakeTimers: true });

// await act(async () => {
//   jest.runAllTimers();
// });

const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('An update to') &&
    args[0].includes('was not wrapped in act')
  ) {
    return;
  }
  originalError(...args);
};
