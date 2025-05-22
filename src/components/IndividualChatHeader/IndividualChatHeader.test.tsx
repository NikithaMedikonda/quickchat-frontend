import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import {IndividualChatHeader} from './IndividualChatHeader';
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    setOptions: mockNavigate,
    goBack: mockGoBack,
  }),
}));
describe('IndividualChatHeader', () => {
  const userDetails = {
    name: 'Chitty',
    profilePicture: '../../assets/user.png',
    phoneNumber: '',
  };
  beforeEach(() => {
    render(<IndividualChatHeader {...userDetails} />);
  });
  test('Should render the back arrow icon', () => {
    const backArrow = screen.getByA11yHint('back-arrow-icon');
    expect(backArrow).toBeTruthy();
  });

  test('Should render the profile picture', () => {
    const profilePicture = screen.getByA11yHint('profile-picture');
    expect(profilePicture).toBeTruthy();
  });

  test('Should render the username', () => {
    const username = screen.getByText('Chitty');
    expect(username).toBeTruthy();
    expect(screen.getByText('Chitty')).toBeTruthy();
  });

  test('Should render the more options icon', () => {
    const moreOptions = screen.getByA11yHint('more-options-icon');
    expect(moreOptions).toBeTruthy();
  });
  test('Should go back upon clicking the back-arrow', async () => {
    const backArrow = screen.getByA11yHint('back-arrow-icon');
    await waitFor(() => {
      fireEvent.press(backArrow);
    });
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
