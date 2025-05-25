import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import { Platform } from 'react-native';
import { IndividualChatHeader } from './IndividualChatHeader';
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    setOptions: mockNavigate,
    goBack: mockGoBack,
  }),
}));
describe('Test for IndividualChatHeader component', () => {
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
describe('Platform-specific back arrow image tests', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      get: () => originalPlatform,
    });
  });

  test('back arrow image on iOS', () => {
    Object.defineProperty(Platform, 'OS', {
      get: () => 'ios',
    });
    render(
      <IndividualChatHeader
        name="Test"
        profilePicture="someUri"
        phoneNumber=""
      />,
    );
    const backArrow = screen.getByA11yHint('back-arrow-icon');
    expect(backArrow.props.source).toEqual(
      require('../../../src/assets/IOSBackArrowDark.png'),
    );
  });

  test('back arrow image on Android', () => {
    Object.defineProperty(Platform, 'OS', {
      get: () => 'android',
    });
    render(
      <IndividualChatHeader
        name="Test"
        profilePicture="someUri"
        phoneNumber=""
      />,
    );
    const backArrow = screen.getByA11yHint('back-arrow-icon');
    expect(backArrow.props.source).toEqual(
      require('../../../src/assets/AndroidBackArrowDark.png'),
    );
  });
});
