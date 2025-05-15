import React from 'react';
import { View, Image, Text } from 'react-native';
import { getStyles } from './ChatBoxContent.styles';
import { useThemeColors } from '../../constants/colors';
import { DEFAULT_PROFILE_IMAGE } from '../../constants/defaultImage';

export const ChatBoxContent = ({
    image,
    name,
    description,
}: {
    image?: string;
    name: string;
    description: string;
}) => {

    const colors = useThemeColors();
    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <View style={styles.innerContent}>
                <Image
                    style={styles.profileImage}
                    source={image ? { uri: image }
                        : { uri: DEFAULT_PROFILE_IMAGE }}
                    accessibilityHint="profile-image"
                />
            </View>
            <View style={styles.details}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.description}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {description}</Text>
            </View>
        </View>
    );
};
