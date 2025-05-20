import React from 'react';
import {render, screen} from '@testing-library/react-native';
import {IndividualChatHeader} from './IndividualChatHeader';

describe('IndividualChatHeader', () => {
  const userDetails = {
    name: 'Chitty',
    profilePicture: '../../assets/user.png',
  };

  test('Should render the back arrow icon', () => {
    render(<IndividualChatHeader {...userDetails} />);
    const backArrow = screen.getByA11yHint('back-arrow-icon');
    expect(backArrow).toBeTruthy();
  });

  test('Should render the profile picture', () => {
    render(<IndividualChatHeader {...userDetails} />);
    const profilePicture = screen.getByA11yHint('profile-picture');
    expect(profilePicture).toBeTruthy();
  });

  test('Should render the username', () => {
    render(<IndividualChatHeader {...userDetails} />);
    const username = screen.getByText('Chitty');
    expect(username).toBeTruthy();
    expect(screen.getByText('Chitty')).toBeTruthy();
  });

  test('Should render the more options icon', () => {
    render(<IndividualChatHeader {...userDetails} />);
    const moreOptions = screen.getByA11yHint('more-options-icon');
    expect(moreOptions).toBeTruthy();
  });
});
