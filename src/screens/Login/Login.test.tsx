import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import React from 'react';
import Login from './Login';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));
const mockNavigate = jest.fn();

jest.mock('react-native-phone-input');

describe('Login Screen', () => {
  beforeEach(() => {
    render(<Login />);
  });
  test('should render the elements correctly', () => {
    expect(screen.getByPlaceholderText('Password')).toBeOnTheScreen();
    expect(screen.getByText('Login')).toBeOnTheScreen();
    expect(screen.getByText('Sign up')).toBeOnTheScreen();
    expect(screen.getByText("Don't have an account?")).toBeOnTheScreen();
  });
  test('should navigate to the register', () => {
    const signUp = screen.getByText('Sign up');
    fireEvent.press(signUp);
    expect(mockNavigate).toHaveBeenCalledWith('register');
  });

  test('should change the value of password upon entering', async () => {
    const phoneNumber = screen.getByPlaceholderText('Password');

    fireEvent.changeText(phoneNumber, {target: {value: 'Anu@1234'}});

    await waitFor(() => {
      expect(phoneNumber.props.value.target.value).toBe('Anu@1234');
    });
  });
});
