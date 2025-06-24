import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {OtpInputModal} from './OtpInputModal';
describe('OtpInputModal', () => {
  const defaultProps = {
    visible: true,
  };
  it('should render validate button as disabled initially', () => {
    const {getByRole} = render(<OtpInputModal {...defaultProps} />);
    const validateButton = getByRole('button', {name: 'Validate OTP'});
    expect(validateButton).toBeDisabled();
  });
  it('should enable validate button when OTP has 4 digits', async () => {
    const {getByLabelText, getByRole} = render(
      <OtpInputModal {...defaultProps} />,
    );
    const otpInput = getByLabelText('One-Time Password');
    const validateButton = getByRole('button', {name: 'Validate OTP'});
    fireEvent.changeText(otpInput, '1234');
    await waitFor(() => {
      expect(validateButton).toBeEnabled();
    });
  });
  it('should keep validate button disabled when OTP has less than 4 digits', () => {
    const {getByLabelText, getByRole} = render(
      <OtpInputModal {...defaultProps} />,
    );
    const otpInput = getByLabelText('One-Time Password');
    fireEvent.changeText(otpInput, '12');
    const validateButton = getByRole('button', {name: 'Validate OTP'});
    expect(validateButton).toBeDisabled();
  });
  it('should call validateOtp when validate button is pressed with valid OTP', async () => {
    const {getByLabelText, getByRole} = render(
      <OtpInputModal {...defaultProps} />,
    );
    const otpInput = getByLabelText('One-Time Password');
    fireEvent.changeText(otpInput, '1234');
    const validateButton = getByRole('button', {name: 'Validate OTP'});
    await waitFor(() => {
      expect(validateButton).toBeEnabled();
    });
    fireEvent.press(validateButton);
  });
});
