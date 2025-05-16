import { View } from 'react-native';
import { ChatBoxContent } from '../ChatBoxContent/ChatBoxContent';
import { TimeStamp } from '../TimeStamp/TimeStamp';
import { getStyles } from './ChatBox.styles';
import { useThemeColors } from '../../constants/colors';
import { Badge } from '../Badge/Badge';

export const ChatBox = ({
    image,
    name,
    description,
    timestamp,
    unreadCount,
}: {
    image: string,
    name: string,
    description: string,
    timestamp: string,
    unreadCount: number,
}) => {
    const colors = useThemeColors();
    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <View style={styles.userDetailsContainer}>
                <ChatBoxContent image={image} name={name} description={description} />
            </View>
            <View style={styles.messageDetailsContainer}>
                <View style={styles.timeStampContainer}>
                    <TimeStamp messageTime={timestamp} />
                </View>
                <View style={styles.badgeContainer}>
                    <Badge messageCount={unreadCount} variant="center" />
                </View>
            </View>
        </View>
    );
};

