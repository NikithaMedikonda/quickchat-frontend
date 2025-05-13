import {render} from '@testing-library/react-native';
import {Button} from './Button';

describe('Button Component', () => {
  it('renders correctly with given title', () => {
    const { getByText } = render(<Button title="Click Me" onPress={() => {}} />);
    expect(getByText('Click Me')).toBeTruthy();
  });
});
