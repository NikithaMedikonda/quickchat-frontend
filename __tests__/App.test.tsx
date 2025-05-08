import React from 'react';
import {App} from '../App';
import {render} from '@testing-library/react-native';
import i18next from 'i18next';

jest.mock('react-native-splash-screen', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

test('renders App component', () => {
  render(<App />);
});

jest.mock('react-native-localize', () => ({
  getLocales: () => [{languageCode: 'te'}],
}));

jest.mock('i18next', () => {
  const actual = jest.requireActual('i18next');
  return {
    ...actual,
    use: () => ({
      init: jest.fn()
    }),
    changeLanguage: jest.fn(),
  };
});

test('runs useEffect on mount and sets language', () => {
  render(<App />);
  expect(i18next.changeLanguage).toHaveBeenCalledWith('te');
});
