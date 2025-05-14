import {render, screen} from '@testing-library/react-native';
import {Home} from './Home';
import {Provider} from 'react-redux';
import {store} from '../../store/store';
import { useThemeColors } from '../../constants/colors';

const mockSetOptions = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    setOptions: mockSetOptions,
    navigate: mockNavigate,
  }),
}));


describe('Home Screen Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets the header options using useLayoutEffect', () => {
    render(
      <Provider store={store}>
        <Home />
      </Provider>,
    );

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerTitle: 'Quick Chat',
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: useThemeColors().background,
      },
      headerTitleStyle: {
        color: useThemeColors().white,
      },
    });
  });

  it('renders Hello home text and navigates on press', () => {
    render(
      <Provider store={store}>
        <Home />
      </Provider>,
    );

    const text = screen.getByText('Hello home');
    expect(text).toBeTruthy();
  });
});
