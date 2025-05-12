import {NavigationContainer} from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import {HomeTabs} from './HomeTabs';

describe('Welcome Screen', () => {
  it('renders the Tabs', () => {
    render(
      <NavigationContainer>
        <HomeTabs />
      </NavigationContainer>,
    );
  });
});
