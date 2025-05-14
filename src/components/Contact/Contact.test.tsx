import {Alert, Linking, Platform} from 'react-native';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import {ContactDetails} from '../../types/contact.types';
import {Contact} from './Contact';
import {DEFAULT_PROFILE_IMAGE} from '../../constants/defaultImage';

Linking.openURL = jest.fn();
Alert.alert = jest.fn();

describe('Contact Component', () => {
  const invitedContact: ContactDetails = {
    name: 'TestUser',
    phoneNumber: '+91123456789',
    profilePicture: DEFAULT_PROFILE_IMAGE,
    toBeInvited: true,
  };

  const registeredContact: ContactDetails = {
    name: 'registeredUser',
    phoneNumber: '+91987654321',
    profilePicture: 'profilePic',
    toBeInvited: false,
  };

  it('renders name, phone number, profile image of registered candidate', () => {
    const {getByText} = render(<Contact contactDetails={registeredContact} />);
    expect(getByText('registeredUser')).toBeTruthy();
    expect(getByText('+91987654321')).toBeTruthy();
    const image = screen.getByA11yHint('profile-image');
    expect(image.props.source).toEqual({uri: 'profilePic'});
  });

  it('renders default profile image for invited contact', () => {
    const {getByText} = render(<Contact contactDetails={invitedContact} />);
    expect(getByText('TestUser')).toBeTruthy();
    expect(getByText('+91123456789')).toBeTruthy();
    const image = screen.getByA11yHint('default-image');
    expect(image.props.source).toEqual({uri: DEFAULT_PROFILE_IMAGE});
  });

  it('should open SMS with correct URL when Invite is pressed', async () => {
    const contact = {
      name: 'Charlie',
      phoneNumber: '+911112223334',
      profilePicture: '',
      toBeInvited: true,
    };

    const url = `sms:+911112223334${
      Platform.OS === 'android' ? '?body=' : '&body='
    }Welcome to Quick Chat. Let's have fun with this chating app`;
    if (Platform.OS === 'android') {
      expect(url).toBe(
        "sms:+911112223334?body=Welcome to Quick Chat. Let's have fun with this chating app",
      );
    } else {
      expect(url).toBe(
        "sms:+911112223334&body=Welcome to Quick Chat. Let's have fun with this chating app",
      );
    }
    const {getByText} = render(<Contact contactDetails={contact} />);
    fireEvent.press(getByText('Invite'));

    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalledWith(url);
    });
  });

  it('should show alert if SMS open fails', async () => {
    const contact = {
      name: 'David',
      phoneNumber: '+919999999999',
      profilePicture: '',
      toBeInvited: true,
    };
    (Linking.openURL as jest.Mock).mockRejectedValueOnce(new Error('Fail'));
    const {getByText} = render(<Contact contactDetails={contact} />);
    fireEvent.press(getByText('Invite'));
    const url = `sms:+911112223334${
      Platform.OS === 'android' ? '?body=' : '&body='
    }Welcome to Quick Chat. Let's have fun with this chating app`;
    if (Platform.OS === 'android') {
      expect(url).toBe(
        "sms:+911112223334?body=Welcome to Quick Chat. Let's have fun with this chating app",
      );
    } else {
      expect(url).toBe(
        "sms:+911112223334&body=Welcome to Quick Chat. Let's have fun with this chating app",
      );
    }
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Unable to process the request');
    });
  });
});
