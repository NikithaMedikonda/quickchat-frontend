import { render } from '@testing-library/react-native';
import { Badge } from './Badge';

describe('Badge component', () => {
  test(' should render the badge with the correct message count when messageCount > 0', () => {
    const {getByText} = render(<Badge messageCount={5} />);
    expect(getByText('5')).toBeTruthy();
  });

  test(' should not render anything when messageCount is 0', () => {
    const {queryByText} = render(<Badge messageCount={0} />);
    expect(queryByText('0')).toBeNull();
  });
});
