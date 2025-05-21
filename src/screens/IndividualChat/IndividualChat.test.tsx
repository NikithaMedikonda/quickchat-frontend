import {render, screen} from '@testing-library/react-native';
import {NavigationContainer, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {IndividualChat} from './IndividualChat';
import {HomeStackParamList} from '../../types/usenavigation.type';

type IndividualChatRouteProp = RouteProp<HomeStackParamList, 'individualChat'>;
const mockRoute: IndividualChatRouteProp = {
  key: 'individualChat',
  name: 'individualChat',
  params: {
    user: {
      name: 'Chitty',
      profilePicture: 'mock/path/to/image.png',
    },
  },
};
const mockNavigation: Partial<
  NativeStackNavigationProp<HomeStackParamList, 'individualChat'>
> = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};
describe('IndividualChat', () => {
  beforeEach(() => {
    render(
      <NavigationContainer>
        <IndividualChat
          navigation={
            mockNavigation as NativeStackNavigationProp<
              HomeStackParamList,
              'individualChat'
            >
          }
          route={mockRoute}
        />
      </NavigationContainer>,
    );
  });
  test('Should render the header component with user details', () => {
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
    const inputBox = screen.getByPlaceholderText('Type a message..');
    expect(inputBox).toBeTruthy();

    const sendIcon = screen.getByA11yHint('send-message-icon');
    expect(sendIcon).toBeTruthy();
  });
});
