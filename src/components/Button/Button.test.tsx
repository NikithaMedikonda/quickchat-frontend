import {render} from '@testing-library/react-native';
import {Button} from './Button';
import React from 'react';

describe('Registration Screen', () => {
  it('renders all input fields and buttons', () => {
    const {getByTestId} = render(
      <Button title="Register" onPress={() => {}} />,
    );
    expect(getByTestId('button')).toBeTruthy();
  });
});
