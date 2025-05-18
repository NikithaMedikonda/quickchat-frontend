import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Home } from './Home';
import { Provider } from 'react-redux';
import { store } from '../../store/store';
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
  it('renders the description', () => {
    const { getByText } = render(<Home />);
    expect(getByText('One message. Infinite possibilities.')).toBeTruthy();
    expect(getByText('What are you waiting for?')).toBeTruthy();
  });
  it('render the plus-image icon', () => {
    render(< Home />);
    const image = screen.getByA11yHint('plus-image');
    expect(image.props.source).toEqual({
      testUri: '../../../src/assets/HomeAddDark.png',
    });
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
        color: useThemeColors().text,
      },
    });
  });

  it('should navigate to contacts screen', async () => {
    render(
      <Provider store={store}>
        <Home />
      </Provider>,
    );
    fireEvent.press(screen.getByA11yHint('plus-image'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('contacts');
    });
    expect(mockSetOptions).toHaveBeenCalledWith({
      headerTitle: 'Quick Chat',
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: useThemeColors().background,
      },
      headerTitleStyle: {
        color: useThemeColors().text,
      },
    });
  });
});
