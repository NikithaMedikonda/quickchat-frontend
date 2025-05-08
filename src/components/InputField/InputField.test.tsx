import React from 'react';
import {render} from '@testing-library/react-native';
import {Placeholder} from './InputField';
describe('Input Field', () => {
  it('renders input fields', () => {
    const {getByPlaceholderText, getByDisplayValue} = render(
      <Placeholder
        title="First Name"
        value="TestUser"
        secureTextEntry={false}
        onChange={() => {}}
      />,
    );
    expect(getByPlaceholderText('First Name')).toBeTruthy();
    expect(getByDisplayValue('TestUser')).toBeTruthy();
  });
});
