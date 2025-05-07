/**
 * @format
 */

import React from 'react';
import {App} from '../App';
import { render } from '@testing-library/react-native';

jest.mock('react-native-splash-screen', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));


test('renders App component', () => {
  render(<App />);
});
