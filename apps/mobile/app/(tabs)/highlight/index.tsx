import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@goalmills/ui';
import { footballApi } from '../../../services/footballApi';
import { VideoHighlight } from '@goalmills/types';
import { VideoCard } from '../../../components/VideoCard';

export default function HighlightScreen() {
    const router = useRouter();
    const [highlights, setHighlights] = useState<VideoHighlight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHighlights();
    }, []);

    const loadHighlights = async () => {
        try {
            const data = await footballApi.getVideoHighlights();
            setHighlights(data);
        } catch (error) {
            console.error('Failed to load highlights:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePress = (id: string) => {
        router.push(`/highlight/${id}`);
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={highlights}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <VideoCard item={item} onPress={() => handlePress(item.id)} />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.heading}>Highlights</Text>
                        <Text style={styles.subheading}>Watch the best moments</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: SPACING.md,
    },
    header: {
        marginBottom: SPACING.lg,
        paddingHorizontal: SPACING.xs,
    },
    heading: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 4,
    },
    subheading: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textLight,
    },
});
