import { ChatBoxContent } from './ChatBoxContent';
import { render, screen } from '@testing-library/react-native';

describe('ChatBoxContent', () => {
    it('renders the profile image', () => {
        render(< ChatBoxContent name="User" description="Hello"/>);
        const image = screen.getByA11yHint('profile-image');
        expect(image.props.source).toEqual({
            testUri: '../../../src/assets/profile-image.png',
        });
    });
    it('render the headerContainer', () => {
          const {getByText} =  render(< ChatBoxContent name="User" description="Hello"/>);
          expect(getByText('User')).toBeTruthy();
           expect(getByText('Hello')).toBeTruthy();
    });
});
