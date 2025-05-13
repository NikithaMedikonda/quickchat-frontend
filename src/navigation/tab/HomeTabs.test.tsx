import {NavigationContainer} from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import {HomeTabs} from './HomeTabs';
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));
describe('Welcome Screen', () => {
  it('renders the Tabs', () => {
    render(
      <NavigationContainer>
        <HomeTabs />
      </NavigationContainer>,
    );
  });
});
