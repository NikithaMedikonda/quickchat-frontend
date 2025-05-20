import { render, screen } from '@testing-library/react-native';
import { ChatBox } from './ChatBox';

describe('ChatBox Component', () => {
    const mockProps = {
        image: 'profile-image',
        name: 'Nagulu',
        description: 'Hello everyone!',
        timestamp: '2025-05-20T12:00:00',
        unreadCount: 3,
    };

    it('renders correctly with all props', () => {
        const { getByText } = render(<ChatBox {...mockProps} />);

        expect(getByText('Nagulu')).toBeTruthy();
        expect(getByText('Hello everyone!')).toBeTruthy();
    });

    it('displays the timestamp', () => {
        const { getByText } = render(<ChatBox {...mockProps} />);
        expect(getByText('12:00:00 pm')).toBeTruthy();
    });

    it('shows the unread badge when unreadCount > 0', () => {
        const { getByText } = render(<ChatBox {...mockProps} />);
        expect(getByText('3')).toBeTruthy();
    });

    it('does not show badge when unreadCount is 0', () => {
        const propsWithZeroUnread = { ...mockProps, unreadCount: 0 };
        const { queryByText } = render(<ChatBox {...propsWithZeroUnread} />);
        expect(queryByText('0')).toBeNull();
    });

    it('renders the image component (ChatBoxContent)', () => {
        render(<ChatBox {...mockProps} />);
        const imageComponent = screen.getByA11yHint('profile-image');
        expect(imageComponent.props.source).toEqual({
            uri: 'profile-image',
        });
    });
});
