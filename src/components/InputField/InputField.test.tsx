import {render} from '@testing-library/react-native';
import {Placeholder} from './InputField';

describe('Test for Input Field component', () => {
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
  it('defaults secureTextEntry to false when not provided', () => {
    const {getByPlaceholderText} = render(
      <Placeholder title="Email" value="" onChange={() => {}} />,
    );

    const input = getByPlaceholderText('Email');
    expect(input.props.secureTextEntry).toBe(false);
  });
});
