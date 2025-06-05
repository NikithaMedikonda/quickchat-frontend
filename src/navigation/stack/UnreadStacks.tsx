import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IndividualChat } from '../../screens/IndividualChat/IndividualChat';
import { UnreadChats } from '../../screens/UnreadChats/UnreadChats';
import { UnreadStackParamList } from '../../types/usenavigation.type';

export const UnreadStacks = () => {
const Stack = createNativeStackNavigator<UnreadStackParamList>();
    return (
        <Stack.Navigator initialRouteName={'unread'}>
            <Stack.Screen
                name="unread"
                component={UnreadChats}
                options={{ headerShown: true }}
            />
            <Stack.Screen
                name="individualChat"
                component={IndividualChat}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};
