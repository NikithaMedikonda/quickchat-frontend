import {render} from '@testing-library/react-native';
import {HomeTabs} from './HomeTabs';
import {NavigationContainer} from '@react-navigation/native';

describe('Welcome Screen', () => {
  it('renders the Tabs', () => {
    render(
      <NavigationContainer>
        <HomeTabs />
      </NavigationContainer>,
    );
  });
});
