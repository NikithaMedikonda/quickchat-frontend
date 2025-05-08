import {render, screen} from '@testing-library/react-native';
import {Profile} from './Profile';

describe('Profile Screen', () => {
  it('renders the profile image', () => {
    render(<Profile />);
    const image = screen.getByA11yHint('profile-image');
    expect(image.props.source).toEqual({
      testUri: '../../../src/assets/profile-img.jpeg',
    });
  });
  it('renders the firstname content', () => {
    render(<Profile />);
    const image = screen.getByA11yHint('firstname-image');
    expect(image.props.source).toEqual({
      testUri: '../../../src/assets/firstname.png',
    });
    expect(screen.getByText('First Name')).toBeDefined();
    expect(screen.getByText('Anoosha')).toBeDefined();
  });
  it('renders the lastname content', () => {
    render(<Profile />);
    const image = screen.getByA11yHint('lastname-image');
    expect(image.props.source).toEqual({
      testUri: '../../../src/assets/lastname.png',
    });
    expect(screen.getByText('Last Name')).toBeDefined();
    expect(screen.getByText('Sanugula')).toBeDefined();
  });
  it('renders the email content', () => {
    render(<Profile />);
    const image = screen.getByA11yHint('email-image');
    expect(image.props.source).toEqual({
      testUri: '../../../src/assets/email.png',
    });
    expect(screen.getByText('Email')).toBeDefined();
    expect(screen.getByText('anoosha@gmail.com')).toBeDefined();
  });
  it('renders the phone number', () => {
    render(<Profile />);
    const image = screen.getByA11yHint('phone-image');
    expect(image.props.source).toEqual({
      testUri: '../../../src/assets/phone.png',
    });
    expect(screen.getByText('Phone')).toBeDefined();
    expect(screen.getByText('9876543256')).toBeDefined();
  });
});
