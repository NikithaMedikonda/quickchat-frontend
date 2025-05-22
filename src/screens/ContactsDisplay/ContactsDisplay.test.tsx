import Contacts from 'react-native-contacts';
import {cleanup, render, screen, waitFor} from '@testing-library/react-native';
import {useNavigation} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {getContacts} from '../../services/GetContacts';
import {useThemeColors} from '../../themes/colors';
import {AlertNotificationRoot, Dialog} from 'react-native-alert-notification';
import {resetForm} from '../../store/slices/registrationSlice';
import {store} from '../../store/store';
import {ContactsDisplay} from './ContactsDisplay';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('react-native-contacts', () => ({
  getAll: jest.fn(),
}));

jest.mock('react-native-contacts', () => ({
  getContactsByPhoneNumber: jest.fn(),
}));

jest.mock('../../services/GetContacts', () => ({
  getContacts: jest.fn(),
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

describe('ContactsDisplay Component', () => {
  let mockNavigation: any;

  beforeEach(() => {
    mockNavigation = {setOptions: jest.fn()};
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    store.dispatch(resetForm());
  });
  afterEach(() => {
    cleanup();
  });

  it('should render loading state initially', async () => {
    (getContacts as jest.Mock).mockResolvedValue({
      data: {
        registeredUsers: [],
        unRegisteredUsers: [],
      },
    });
    render(
      <Provider store={store}>
        <AlertNotificationRoot>
          <ContactsDisplay />
        </AlertNotificationRoot>
      </Provider>,
    );
    await waitFor(() => {
      expect(screen.getByText('Loading Contacts...')).toBeTruthy();
    });
  });

  it('should display contacts when data is fetched', async () => {
    const mockAppContacts = [
      {
        name: 'Usha',
        phoneNumber: '12345',
        profilePicture: '',
        toBeInvited: false,
      },
    ];

    const mockPhoneContacts = [
      {
        name: 'Usha1',
        phoneNumber: '67890',
        profilePicture: '',
        toBeInvited: true,
      },
    ];

    (getContacts as jest.Mock).mockResolvedValue({
      data: {
        registeredUsers: mockAppContacts,
        unRegisteredUsers: [mockPhoneContacts[0].phoneNumber],
      },
    });

    (Contacts.getContactsByPhoneNumber as jest.Mock).mockResolvedValue([
      {givenName: 'Usha', displayName: 'Usha'},
    ]);

    const {getByText} = render(
      <Provider store={store}>
        <AlertNotificationRoot>
          <ContactsDisplay />
        </AlertNotificationRoot>
      </Provider>,
    );

    await waitFor(() => {
      expect(getByText('Contacts on Quick Chat')).toBeTruthy();
      expect(getByText('Invite to Quick Chat')).toBeTruthy();
    });
  });

  it('should show no contacts message when no app contacts are available', async () => {
    (getContacts as jest.Mock).mockResolvedValue({
      data: {
        registeredUsers: [],
        unRegisteredUsers: [],
      },
    });

    const {getByText} = render(
      <Provider store={store}>
        <AlertNotificationRoot>
          <ContactsDisplay />
        </AlertNotificationRoot>
      </Provider>,
    );

    await waitFor(() => {
      expect(
        getByText(
          // eslint-disable-next-line no-useless-escape
          `It\'s so sad that, we have no one on Quick Chat. Share about Quick Chat`,
        ),
      ).toBeTruthy();
    });
  });

  it('should show no phone contacts message when no phone contacts are available', async () => {
    (getContacts as jest.Mock).mockResolvedValue({
      data: {
        registeredUsers: [],
        unRegisteredUsers: [],
      },
    });

    const {getByText} = render(
      <Provider store={store}>
        <AlertNotificationRoot>
          <ContactsDisplay />
        </AlertNotificationRoot>
      </Provider>,
    );

    await waitFor(() => {
      expect(
        getByText(
          "It's good to see that, all of your contact are onuick Chat.",
        ),
      ).toBeTruthy();
    });
  });

  it('should use "unknown" as name if givenName is missing', async () => {
    (getContacts as jest.Mock).mockResolvedValue({
      data: {
        registeredUsers: [],
        unRegisteredUsers: ['67890'],
      },
    });

    // givenName is missing
    (Contacts.getContactsByPhoneNumber as jest.Mock).mockResolvedValue([
      {displayName: ''}, // no givenName
    ]);

    const {getByText} = render(
      <Provider store={store}>
        <AlertNotificationRoot>
          <ContactsDisplay />
        </AlertNotificationRoot>
      </Provider>,
    );

    await waitFor(() => {
      expect(getByText('unknown')).toBeTruthy();
    });
  });

  it('should set the header options correctly', async () => {
    (getContacts as jest.Mock).mockImplementation(() =>
      Promise.resolve({data: {registeredUsers: [], unRegisteredUsers: []}}),
    );

    render(
      <Provider store={store}>
        <AlertNotificationRoot>
          <ContactsDisplay />
        </AlertNotificationRoot>
      </Provider>,
    );

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

    const optionsArg = mockNavigation.setOptions.mock.calls[0][0];
    const HeaderLeftComponent = optionsArg.headerLeft?.();
    const {getByText} = render(<>{HeaderLeftComponent}</>);
    await waitFor(() => {
      expect(getByText('く')).toBeTruthy();
    });
  });

  it('should show alert when getContacts throws error', async () => {
    (getContacts as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    render(
      <Provider store={store}>
        <AlertNotificationRoot>
          <ContactsDisplay />
        </AlertNotificationRoot>
      </Provider>,
    );

    await waitFor(() => {
      expect(Dialog.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'DANGER',
          title: 'Error',
          textBody: 'Error occured while fetching the contacts',
          button: 'close',
          closeOnOverlayTap: true,
        }),
      );
    });
  });
});
