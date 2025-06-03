import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '../../store/store';
import { UnreadStacks } from './UnreadStacks';

jest.mock('../../screens/UnreadChats/UnreadChats', () => {
    const { Text, Button } = require('react-native');
    return {
        UnreadChats: ({ navigation }: any) => (
            <>
                <Text>Unread Chats Screen</Text>
                <Button
                    title="Go to Individual Chat"
                    onPress={() => navigation.navigate('individualChat')}
                />
            </>
        ),
    };
});

jest.mock('../../screens/IndividualChat/IndividualChat', () => {
    const { Text } = require('react-native');
    return {
        IndividualChat: () => <Text>Individual Chat Screen</Text>,
    };
});

describe('UnreadStacks Navigation', () => {
    const renderWithProviders = () =>
        render(
            <Provider store={store}>
                <NavigationContainer>
                    <UnreadStacks />
                </NavigationContainer>
            </Provider>
        );

    it('renders the UnreadChats screen initially', async () => {
        const { getByText } = renderWithProviders();

        await waitFor(() => {
            expect(getByText('Unread Chats Screen')).toBeTruthy();
        });
    });

    it('navigates to IndividualChat screen on button press', async () => {
        const { getByText } = renderWithProviders();

        fireEvent.press(getByText('Go to Individual Chat'));

        await waitFor(() => {
            expect(getByText('Individual Chat Screen')).toBeTruthy();
        });
    });
});
