import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { CricketSeries } from '@goalmills/types';
import { cricketApi } from '../../../services/cricketApi';
import { Ionicons } from '@expo/vector-icons';

export default function CricketSeriesListScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [seriesList, setSeriesList] = useState<CricketSeries[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await cricketApi.getSeries();
                setSeriesList(response.series);
            } catch (error) {
                console.error('Error loading series:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const renderItem = ({ item }: { item: CricketSeries }) => (
        <TouchableOpacity style={styles.card} onPress={() => { /* Navigate to series details if needed */ }}>
            <View style={styles.header}>
                <Text style={styles.seriesName}>{item.name}</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.seriesType}</Text>
                </View>
            </View>
            <View style={styles.details}>
                <View style={styles.row}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
                    <Text style={styles.detailText}>
                        {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                    </Text>
                </View>
                {item.country && (
                    <View style={styles.row}>
                        <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
                        <Text style={styles.detailText}>{item.country}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Series',
                    headerStyle: { backgroundColor: COLORS.backgroundDark },
                    headerTintColor: COLORS.text,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    ),
                }}
            />
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.secondary} />
                </View>
            ) : (
                <FlatList
                    data={seriesList}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: SPACING.md,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    seriesName: {
        color: COLORS.background,
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        flex: 1,
        marginRight: SPACING.sm,
    },
    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: SPACING.xs,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    badgeText: {
        color: COLORS.secondary,
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    details: {
        gap: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.sm,
    },
});
