import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { IndividualChat } from './IndividualChat';

const testUser = {
  name: 'Chitty',
  profilePicture: '/Users/keerthana/Documents/Internal-project/quickchat-frontend/src/assets/user.png',
};

describe('IndividualChat', () => {
  test('Should render the header component with user details', () => {
    render(<IndividualChat user={testUser} />);

    const username = screen.getByA11yHint('username-text');
    expect(username).toBeTruthy();

    const profilePicture = screen.getByA11yHint('profile-picture');
    expect(profilePicture).toBeTruthy();

    const backArrow = screen.getByA11yHint('back-arrow-icon');
    expect(backArrow).toBeTruthy();

    const moreOptions = screen.getByA11yHint('more-options-icon');
    expect(moreOptions).toBeTruthy();
  });

  test('Should render the message input component', () => {
    render(<IndividualChat user={testUser} />);

    const inputBox = screen.getByPlaceholderText('Type a message..');
    expect(inputBox).toBeTruthy();

    const sendIcon = screen.getByA11yHint('send-message-icon');
    expect(sendIcon).toBeTruthy();
  });
});
