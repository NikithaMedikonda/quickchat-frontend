import { View } from 'react-native';
import { useThemeColors } from '../../themes/colors';
import { Badge } from '../Badge/Badge';
import { ChatBoxContent } from '../ChatBoxContent/ChatBoxContent';
import { TimeStamp } from '../TimeStamp/TimeStamp';
import { getStyles } from './ChatBox.styles';

export const ChatBox = ({
    image,
    name,
    description,
    timestamp,
    unreadCount,
    status,
}: {
    image: string | null,
    name: string,
    description: string,
    timestamp: string,
    unreadCount: number,
    status?: 'sent' | 'delivered' | 'read',
}) => {
    const colors = useThemeColors();
    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <View style={styles.userDetailsContainer}>
                <ChatBoxContent image={image} name={name} status={status} description={description} />
            </View>
            <View style={styles.messageDetailsContainer}>
                <View style={styles.timeStampContainer}>
                    <TimeStamp messageTime={timestamp} isSent={true} showFullTime = {false}/>
                </View>
                <View style={styles.badgeContainer}>
                    <Badge messageCount={unreadCount} variant="center" />
                </View>
            </View>
        </View>
    );
};
