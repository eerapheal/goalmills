import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { CricketLeague, CricketEvent } from '@goalmills/types';
import { advancedCricketApi } from '../../../../../services/advancedCricketApi';
import { CricketMatchCard } from '../../../../../components/CricketMatchCard';
import { Ionicons } from '@expo/vector-icons';

export default function CricketSeriesDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [series, setSeries] = useState<CricketLeague | null>(null);
    const [fixtures, setFixtures] = useState<CricketEvent[]>([]);
    const [activeTab, setActiveTab] = useState<'fixtures' | 'rankings'>('fixtures');


    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                // Fetch series info from leagues list
                const leaguesRes = await advancedCricketApi.getLeagues();
                const foundSeries = leaguesRes.result?.find(l => l.league_key === id);
                setSeries(foundSeries || null);

                // Fetch fixtures for this league
                const today = new Date();
                const pastDate = new Date(today);
                pastDate.setDate(today.getDate() - 14);
                const futureDate = new Date(today);
                futureDate.setDate(today.getDate() + 30);

                const fixturesRes = await advancedCricketApi.getFixtures({
                    leagueId: Number(id),
                    from: pastDate.toISOString().split('T')[0],
                    to: futureDate.toISOString().split('T')[0],
                });

                setFixtures(fixturesRes.result || []);

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
                    title: series.league_name,
                    headerStyle: { backgroundColor: '#0a0e27' },
                    headerTintColor: '#fff',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                    ),
                }}
            />
            <View style={styles.header}>
                <View style={styles.headerImage}>
                    {series.league_logo ? (
                        <Image source={{ uri: series.league_logo }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                    ) : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                            <Text style={{ fontSize: 48, fontWeight: '900', color: COLORS.secondary }}>{series.league_name.charAt(0)}</Text>
                        </View>
                    )}
                    <View style={styles.imageOverlay} />
                    <View style={styles.headerContentOverlay}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{series.league_season}</Text>
                        </View>
                        <Text style={styles.title}>{series.league_name}</Text>
                        <Text style={styles.subtitle}>{series.league_year}</Text>
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
                    keyExtractor={(item) => item.event_key.toString()}
                    contentContainerStyle={styles.content}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No upcoming matches found.</Text>
                        </View>
                    }
                />
            ) : (
                <View style={styles.content}>
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>RANKINGS INITIALIZING</Text>
                        <Text style={styles.emptyText}>Table data unavailable for this series.</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0e27',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0e27',
    },
    content: {
        padding: 16,
    },
    header: {
        backgroundColor: '#0a0e27',
    },
    headerImage: {
        width: '100%',
        height: 240,
        backgroundColor: 'rgba(255,255,255,0.05)',
        position: 'relative',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(10, 14, 39, 0.7)',
    },
    headerContentOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    badge: {
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    badgeText: {
        color: '#000',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    errorText: {
        color: '#f43f5e',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 40,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyTitle: {
        color: 'rgba(255, 255, 255, 0.2)',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 8,
    },
    emptyText: {
        color: 'rgba(255, 255, 255, 0.4)',
        textAlign: 'center',
        fontStyle: 'italic',
        fontSize: 12,
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        backgroundColor: '#0a0e27',
    },
    tab: {
        paddingVertical: 16,
        marginRight: 24,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.secondary,
    },
    tabText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    activeTabText: {
        color: '#fff',
    },
});
