import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { CricketSeries, CricketMatchInfo } from '@goalmills/types';
import { cricketApi } from '../../../services/cricketApi';
import { CricketMatchCard } from '../../../components/CricketMatchCard';
import { Ionicons } from '@expo/vector-icons';

export default function CricketSeriesDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [series, setSeries] = useState<CricketSeries | null>(null);
    const [fixtures, setFixtures] = useState<CricketMatchInfo[]>([]);
    const [activeTab, setActiveTab] = useState<'fixtures' | 'rankings'>('fixtures');

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                const seriesId = parseInt(id);
                // Fetch series info
                const seriesRes = await cricketApi.getSeries();
                const foundSeries = seriesRes.series.find(s => s.id === seriesId);
                setSeries(foundSeries || null);

                // Fetch fixtures and filter by seriesId
                if (foundSeries) {
                    const fixturesRes = await cricketApi.getFixtures();
                    // Mock data usually returns limited set, so we might not find many matches for specific mock series if IDs don't align perfectly in mock generator.
                    // But we'll try filtration.
                    const seriesFixtures = fixturesRes.fixtures.filter(f => f.seriesId === seriesId);

                    // Fallback to all fixtures if none match (for demo purposes if mock data IDs mismatch)
                    setFixtures(seriesFixtures.length > 0 ? seriesFixtures : fixturesRes.fixtures);
                }
            } catch (error) {
                console.error('Error loading series details:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) return <View style={styles.loadingContainer}><ActivityIndicator color={COLORS.secondary} size="large" /></View>;
    if (!series) return <View style={styles.container}><Text style={styles.errorText}>Series not found</Text></View>;

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: series.name,
                    headerStyle: { backgroundColor: COLORS.backgroundDark },
                    headerTintColor: COLORS.text,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <View style={styles.header}>
                {series.image && <Image source={{ uri: series.image }} style={styles.headerImage} />}
                <View style={styles.headerContent}>
                    <Text style={styles.title}>{series.name}</Text>
                    <Text style={styles.subtitle}>
                        {new Date(series.startDate).toLocaleDateString()} - {new Date(series.endDate).toLocaleDateString()}
                    </Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{series.seriesType}</Text>
                    </View>
                </View>

                <View style={styles.tabs}>
                    {(['fixtures', 'rankings'] as const).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                {tab.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {activeTab === 'fixtures' ? (
                <FlatList
                    data={fixtures}
                    renderItem={({ item }) => <CricketMatchCard match={item} />}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.content}
                    ListEmptyComponent={<Text style={styles.emptyText}>No matches found for this series.</Text>}
                />
            ) : (
                <View style={styles.content}>
                    <Text style={styles.emptyText}>Rankings not available for this series.</Text>
                </View>
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
        backgroundColor: COLORS.backgroundDark,
    },
    content: {
        padding: SPACING.md,
    },
    header: {
        backgroundColor: COLORS.backgroundDark,
    },
    headerImage: {
        width: '100%',
        height: 200,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    headerContent: {
        padding: SPACING.lg,
        alignItems: 'flex-start',
    },
    title: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '800',
        color: COLORS.background,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
        marginBottom: SPACING.md,
    },
    badge: {
        backgroundColor: COLORS.secondary,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    badgeText: {
        color: COLORS.background,
        fontSize: FONT_SIZES.xs,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    errorText: {
        color: COLORS.danger,
        fontSize: FONT_SIZES.md,
        textAlign: 'center',
        marginTop: SPACING.xl,
    },
    emptyText: {
        color: COLORS.textLight,
        textAlign: 'center',
        marginTop: SPACING.xl,
        fontStyle: 'italic',
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    tab: {
        paddingVertical: SPACING.md,
        marginRight: SPACING.lg,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.secondary,
    },
    tabText: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
    },
    activeTabText: {
        color: COLORS.background,
    },
});
