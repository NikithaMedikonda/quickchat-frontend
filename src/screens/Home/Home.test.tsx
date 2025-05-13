import {render, screen} from '@testing-library/react-native';
import { Home } from './Home';

describe.only('Home Screen', () => {
  it.only('renders the description', () => {
    const { getByText } = render(<Home/>);
    expect(getByText('You have no chats. Start Messaging!')).toBeTruthy();
  });
  it.only('render the plus-image icon', () => {
    render(< Home/>);
        const image = screen.getByA11yHint('plus-image');
        expect(image.props.source).toEqual({
            testUri: '../../src/assets/plus-icon.png',
        });
  });
});
