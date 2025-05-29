import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import * as reactRedux from 'react-redux';
import { CustomAlert } from './CustomAlert';
import { setAlertVisible } from '../../store/slices/registrationSlice';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../../assets/warning-2.png', () => 'warningImage');
jest.mock('../../assets/cross-3.png', () => 'errorImage');
jest.mock('../../assets/check.png', () => 'successImage');
jest.mock('../../assets/information-2.png', () => 'infoImage');

describe('CustomAlert Component', () => {
  const useDispatchMock = reactRedux.useDispatch as unknown as jest.Mock;
  const useSelectorMock = reactRedux.useSelector as unknown as jest.Mock;
  const mockDispatch = jest.fn();

  beforeEach(() => {
    useDispatchMock.mockReturnValue(mockDispatch);
    useSelectorMock.mockImplementation(callback =>
      callback({ registration: { alertVisible: true } })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders success alert correctly', () => {
    const { getByText } = render(
      <CustomAlert type="success" title="Success!" message="Registration completed." />
    );
    expect(getByText('Success!')).toBeTruthy();
    expect(getByText('Registration completed.')).toBeTruthy();
    expect(() => getByText('OK')).toThrow();
  });

  it('renders warning alert with OK button and triggers onConfirm', () => {
    const { getByText } = render(
      <CustomAlert type="warning" title="Warning!" message="This is a warning." />
    );
    expect(getByText('Warning!')).toBeTruthy();
    expect(getByText('This is a warning.')).toBeTruthy();

    const okButton = getByText('OK');
    fireEvent.press(okButton);

    expect(mockDispatch).toHaveBeenCalledWith(setAlertVisible(false));
  });

  it('renders error alert correctly', () => {
    const { getByText } = render(
      <CustomAlert type="error" title="Error!" message="Something went wrong." />
    );
    expect(getByText('Error!')).toBeTruthy();
    expect(getByText('Something went wrong.')).toBeTruthy();
    expect(getByText('OK')).toBeTruthy();
  });

  it('renders info alert correctly', () => {
    const { getByText } = render(
      <CustomAlert type="info" title="Note" message="FYI..." />
    );
    expect(getByText('Note')).toBeTruthy();
    expect(getByText('FYI...')).toBeTruthy();
    expect(getByText('OK')).toBeTruthy();
  });
});
