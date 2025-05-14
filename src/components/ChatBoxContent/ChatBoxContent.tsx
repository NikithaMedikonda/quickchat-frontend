import React from 'react';
import { View, Image, Text } from 'react-native';
import { getStyles } from './ChatBoxContent.styles';
import { useThemeColors } from '../../constants/colors';

export const ChatBoxContent = ({
    name,
    description,
}: {
        name: String,
        description: String
    }) => {

    const colors = useThemeColors();
    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <View style={styles.innerContent}>
                <Image
                    style={styles.profileImage}
                    source={require('./../../assets/profile-image.png')}
                    accessibilityHint="profile-image"
                />
            </View>
            <View style={styles.details}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
        </View>
    );
};
