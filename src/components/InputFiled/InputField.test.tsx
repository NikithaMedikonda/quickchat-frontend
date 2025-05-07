import React from 'react';
import {render} from '@testing-library/react-native';
import {Placeholder} from './InputField';
describe('Registration Screen', () => {
  it('renders all input fields and buttons', () => {
    const {getByTestId} = render(
      <Placeholder title="First Name" value="TestUser"  secureTextEntry={false} onChange={() => {}}   />,
    );
    expect(getByTestId('inputField')).toBeTruthy();
  });
});
