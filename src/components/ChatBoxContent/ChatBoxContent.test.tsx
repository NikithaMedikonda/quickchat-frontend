import { render, screen } from '@testing-library/react-native';
import { ChatBoxContent } from './ChatBoxContent';

describe('ChatBoxContent', () => {
    it('renders the profile image', () => {
        render(< ChatBoxContent name="User" description="Hello" />);
        const image = screen.getByA11yHint('profile-image');
        expect(image.props.source).toEqual({
            uri: 'https://sdjetntpocezxjoelxgb.supabase.co/storage/v1/object/public/quick-chat/images/profile-pics/image.png',
        });
    });
    it('render the headerContainer', () => {
        const { getByText } = render(< ChatBoxContent name="Nagulu" description="Hello everyone" />);
        expect(getByText('Nagulu')).toBeTruthy();
        expect(getByText('Hello everyone')).toBeTruthy();
    });
});
