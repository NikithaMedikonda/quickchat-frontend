import {useNavigation} from '@react-navigation/native';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import {Alert, Platform} from 'react-native';
import {Provider} from 'react-redux';
import {numberNameIndex} from '../../helpers/nameNumberIndex';
import {getContacts} from '../../services/GetContacts';
import {store} from '../../store/store';
import {useThemeColors} from '../../themes/colors';
import {useImagesColors} from '../../themes/images';
import {ContactsDisplay} from './ContactsDisplay';
jest.setTimeout(10000);
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));
jest.mock('../../services/useDeviceCheck', () => ({
  useDeviceCheck: jest.fn(),
}));
jest.mock('react-native-contacts', () => ({
  getAll: jest.fn(),
  getContactsByPhoneNumber: jest.fn(),
}));
jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
jest.mock('../../services/GetContacts', () => ({
  getContacts: jest.fn(),
}));
jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
jest.mock('../../helpers/nameNumberIndex', () => ({
  numberNameIndex: jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str,
  }),
}));
jest.mock('react-native-alert-notification', () => ({
  ALERT_TYPE: {
    DANGER: 'DANGER',
  },
  Dialog: {
    show: jest.fn(),
  },
  AlertNotificationRoot: ({children}: {children: React.ReactNode}) => children,
}));
describe('Tests for ContactsDisplay Component', () => {
  let mockNavigation: any;
  const {androidBackArrow, iOSBackArrow} = useImagesColors();
  const renderComponent = () => {
    render(
      <Provider store={store}>
        <ContactsDisplay />
      </Provider>,
    );
  };
  beforeEach(async () => {
    jest.clearAllMocks();
    mockNavigation = {
      setOptions: jest.fn(),
      navigate: jest.fn(),
      goBack: jest.fn(),
    };
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
  });
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });
  it('should render contacts screen after successful fetch', async () => {
    const mockContacts = {
      registeredUsers: [
        {phoneNumber: '+916303961097', profilePicture: '', name: 'Usha'},
      ],
      unRegisteredUsers: ['+916303974914'],
    };
    (getContacts as jest.Mock).mockResolvedValue(mockContacts);
    (numberNameIndex as jest.Mock).mockResolvedValue({
      '+916303961097': 'Usha',
      '+916303974914': 'unknown',
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.queryByTestId('loader')).toBeNull();
    });
    const title = await screen.getByText('Contacts on Quick Chat');
    const inviteText = await screen.getByText('Invite to Quick Chat');
    const registeredUser = await screen.getByText('Usha');
    const unRegisteredUser = await screen.getByText('unknown');
    await waitFor(() => {
      expect(title).toBeTruthy();
      expect(inviteText).toBeTruthy();
      expect(registeredUser).toBeTruthy();
      expect(unRegisteredUser).toBeTruthy();
    });
  });
  it('should handle pull to refresh functionality', async () => {
    const mockContacts = {
      registeredUsers: [
        {phoneNumber: '+916303961097', profilePicture: '', name: 'Usha'},
      ],
      unRegisteredUsers: ['+916303974914'],
    };
    (getContacts as jest.Mock).mockResolvedValue(mockContacts);
    (numberNameIndex as jest.Mock).mockResolvedValue({
      '+916303961097': 'Usha',
      '+916303974914': 'unknown',
    });
    renderComponent();
    await waitFor(
      () => {
        expect(screen.queryByTestId('loader')).toBeNull();
      },
      {timeout: 5000},
    );
    await waitFor(() => {
      const scrollView = screen.getByA11yHint('refresh-option');
      const refreshControl = scrollView.props.refreshControl;
      fireEvent(scrollView, 'refresh', {
        nativeEvent: {
          contentOffset: {y: -100},
        },
      });
      refreshControl.props.onRefresh();
      expect(getContacts as jest.Mock).toHaveBeenCalledWith(true);
    });
  });
  it('should set the header options correctly', async () => {
    (getContacts as jest.Mock).mockResolvedValue({
      registeredUsers: [],
      unRegisteredUsers: ['+916303961098'],
    });
    await waitFor(() => {
      renderComponent();
    });
    await waitFor(() => {
      expect(mockNavigation.setOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          headerTitle: 'Contacts',
          headerTitleAlign: 'center',
          headerStyle: {backgroundColor: useThemeColors().background},
          headerTitleStyle: {color: useThemeColors().text},
        }),
      );
    });
    const HeaderLeftComponent =
      mockNavigation.setOptions.mock.calls[0][0].headerLeft();
    render(<>{HeaderLeftComponent}</>);
    const image = screen.getByA11yHint('back-arrow-image');
    await waitFor(() => {
      if (Platform.OS === 'android') {
        expect(image.props.source).toBe(androidBackArrow);
      } else {
        expect(image.props.source).toBe(iOSBackArrow);
      }
    });
  });
  it('should goback when tapped on goback arrow', async () => {
    renderComponent();
    await waitFor(() => {
      const HeaderLeftComponent =
        mockNavigation.setOptions.mock.calls[0][0].headerLeft();
      render(<>{HeaderLeftComponent}</>);
      const image = screen.getByA11yHint('back-arrow-image');
      fireEvent.press(image);
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });
it('should set empty contacts if index is falsy', async () => {
  const mockContacts = {
    registeredUsers: [
      {phoneNumber: '+916303961097', profilePicture: '', name: 'Usha'},
    ],
    unRegisteredUsers: ['+916303974914'],
  };
  (getContacts as jest.Mock).mockResolvedValue(mockContacts);
  (numberNameIndex as jest.Mock).mockResolvedValue(null);
  renderComponent();
  await waitFor(() => {
    expect(screen.queryByText('Usha')).toBeNull();
  });
});
it('should show alert when fetchContacts throws error', async () => {
  const mockError = new Error('Something went wrong');
  (getContacts as jest.Mock).mockRejectedValue(mockError);
  (numberNameIndex as jest.Mock).mockResolvedValue({});
  const alertSpy = jest.spyOn(Alert, 'alert');
  renderComponent();
  await waitFor(() => {
    expect(alertSpy).toHaveBeenCalledWith(
      'Error while fetching the contacts: Something went wrong',
    );
  });
});
});