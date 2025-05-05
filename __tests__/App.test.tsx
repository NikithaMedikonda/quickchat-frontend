/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  const tree = ReactTestRenderer.create(<App />).toJSON();
  expect(tree).toMatchSnapshot();
  });

