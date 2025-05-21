import { NavigationContainer } from '@react-navigation/native';
import { render, screen } from '@testing-library/react-native';

import { IndividualChatHeader } from './IndividualChatHeader';

describe('IndividualChatHeader', () => {
  const userDetails = {
    name: 'Chitty',
    profilePicture: '../../assets/user.png',
  };
  beforeEach(() => {
    render(
      <NavigationContainer>
        <IndividualChatHeader {...userDetails} />
      </NavigationContainer>,
    );
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
});
