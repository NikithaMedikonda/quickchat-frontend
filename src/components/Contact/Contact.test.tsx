import {render, screen} from '@testing-library/react-native';
import {ContactDetails} from '../../types/contact.types';
import {Contact} from './Contact';
import {DEFAULT_PROFILE_IMAGE} from '../../constants/defaultImage';

describe('Contact Component', () => {
  const invitedContact: ContactDetails = {
    name: 'TestUser',
    phoneNumber: '+91123456789',
    profilePic: DEFAULT_PROFILE_IMAGE,
    toBeInvited: true,
  };

  const registeredContact: ContactDetails = {
    name: 'registeredUser',
    phoneNumber: '+91987654321',
    profilePic: 'profilePic',
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
});
