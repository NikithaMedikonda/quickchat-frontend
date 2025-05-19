import {Alert} from 'react-native';
import Contacts from 'react-native-contacts';
import {cleanup, render, screen, waitFor} from '@testing-library/react-native';
import {useNavigation} from '@react-navigation/native';
import {ContactsDisplay} from './ContactsDisplay';
import {getContacts} from '../../services/GetContacts';
import {useThemeColors} from '../../themes/colors';


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

describe('ContactsDisplay Component', () => {
  let mockNavigation: any;

  beforeEach(() => {
    mockNavigation = {setOptions: jest.fn()};
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
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

    // await act(async () => {
    render(<ContactsDisplay />);
    // });
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

    const {getByText} = render(<ContactsDisplay />);

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

    const {getByText} = render(<ContactsDisplay />);

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

    const {getByText} = render(<ContactsDisplay />);

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

    const {getByText} = render(<ContactsDisplay />);

    await waitFor(() => {
      expect(getByText('unknown')).toBeTruthy();
    });
  });

  it('should set the header options correctly', async () => {
    (getContacts as jest.Mock).mockImplementation(() =>
      Promise.resolve({data: {registeredUsers: [], unRegisteredUsers: []}}),
    );

    render(<ContactsDisplay />);

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
    (getContacts as jest.Mock).mockRejectedValue(new Error('Network Error'));

    const alertSpy = jest.spyOn(Alert, 'alert');

    render(<ContactsDisplay />);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Error while fetching the contacts',
      );
    });
  });
});
