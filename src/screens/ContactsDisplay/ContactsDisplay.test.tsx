import {useNavigation} from '@react-navigation/native';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import Contacts from 'react-native-contacts';
import {Provider} from 'react-redux';
import {getContacts} from '../../services/GetContacts';
import {resetForm} from '../../store/slices/registrationSlice';
import {store} from '../../store/store';
import {useThemeColors} from '../../themes/colors';
import {ContactsDisplay} from './ContactsDisplay';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('react-native-contacts', () => ({
  getAll: jest.fn(),
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
  const renderComponent = () => {
    render(
      <Provider store={store}>
          <ContactsDisplay />
      </Provider>,
    );
  };

  let mockNavigation: any;
  beforeEach(() => {
    mockNavigation = {setOptions: jest.fn(), navigate: jest.fn()};
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
    renderComponent();
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
    await waitFor(() => {
      renderComponent();
    });

    (getContacts as jest.Mock).mockResolvedValue({
      data: {
        registeredUsers: mockAppContacts,
        unRegisteredUsers: [mockPhoneContacts[0].phoneNumber],
      },
    });

    (Contacts.getContactsByPhoneNumber as jest.Mock).mockResolvedValue([
      {givenName: 'Usha', displayName: 'Usha'},
    ]);

    await waitFor(() => {
      expect(screen.getByText('Contacts on Quick Chat')).toBeTruthy();
      expect(screen.getByText('Invite to Quick Chat')).toBeTruthy();
    });
  });

  it('should show no contacts message when no app contacts are available', async () => {
    (getContacts as jest.Mock).mockResolvedValue({
      data: {
        registeredUsers: [],
        unRegisteredUsers: [],
      },
    });
    await waitFor(() => {
      renderComponent();
    });
    await waitFor(() => {
      expect(
        screen.getByText(
          `It's so sad that, we have no one on Quick Chat. Share about Quick Chat`,
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
    await waitFor(() => {
      renderComponent();
    });
    await waitFor(() => {
      expect(
        screen.getByText(
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

    await waitFor(() => {
      renderComponent();
    });
    (Contacts.getContactsByPhoneNumber as jest.Mock).mockResolvedValue([
      {displayName: ''},
    ]);
    await waitFor(() => {
      expect(screen.getByText('unknown')).toBeTruthy();
    });
  });

  it('should set the header options correctly', async () => {
    (getContacts as jest.Mock).mockImplementation(() =>
      Promise.resolve({data: {registeredUsers: [], unRegisteredUsers: []}}),
    );

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
    const {getByText} = render(<>{HeaderLeftComponent}</>);

    await waitFor(() => {
      expect(getByText('く')).toBeTruthy();
    });
  });

  it('should show alert when getContacts throws error', async () => {
    (getContacts as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    render(
      <Provider store={store}>
          <ContactsDisplay />
      </Provider>,
    );
    await waitFor(() => {
      const state = store.getState();
      expect(state.registration.alertMessage).toBe('Network error');
      expect(state.registration.alertType).toBe('info');
  });
});

  it('should navigate to individual chat screen when it is clicked on contact', async () => {
    (getContacts as jest.Mock).mockResolvedValue({
      data: {
        registeredUsers: [
          {
            name: 'Mamatha',
            profilePicture: 'https://mamatha.profile.come',
            phoneNumber: '+916303974914',
          },
        ],
        unRegisteredUsers: [],
      },
    });
    await waitFor(() => {
      renderComponent();
    });
    await waitFor(() => {
      expect(screen.getByText('Mamatha')).toBeTruthy();
    });

    fireEvent.press(screen.getByAccessibilityHint('contact-label'));

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('individualChat', {
        user: {
          name: 'Mamatha',
          profilePicture: 'https://mamatha.profile.come',
          phoneNumber: '+916303974914',
          isBlocked: false,
          onBlockStatusChange: expect.any(Function),
        },
      });
  });
})
});
