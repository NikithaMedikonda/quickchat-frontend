import { render, screen } from '@testing-library/react-native';
import PlusIcon from './PlusIcon';

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            setOptions: jest.fn(),
        }),
    };
});

describe('Plus Icon Tests', () => {
    it('renders the plus-image icon', () => {
        render(<PlusIcon />);
        const image = screen.getByA11yHint('plus-image');
        expect(image.props.source).toEqual({
            testUri: '../../../src/assets/plus-icon.png',
        });
    });
});
