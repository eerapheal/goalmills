import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { footballApi } from '../../../../services/footballApi';
import { League, Fixture, Standing } from '@goalmills/types';
import { FixtureCard } from '../../../../components/FixtureCard';
import { StandingsTable } from '../../../../components/StandingsTable';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';

type Tab = 'live' | 'upcoming' | 'results' | 'standings';

export default function LeagueDetails() {
    const { id } = useLocalSearchParams();
    const [league, setLeague] = useState<League | null>(null);
    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [standings, setStandings] = useState<Standing[]>([]);
    const [activeTab, setActiveTab] = useState<Tab>('upcoming');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id, activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const leagueData = await footballApi.getLeagueById(Number(id));
            setLeague(leagueData);

            if (activeTab === 'standings') {
                const standingsData = await footballApi.getStandingsByLeague(Number(id));
                setStandings(standingsData);
            } else {
                const allFixtures = await footballApi.getFixturesByLeague(Number(id));
                let filtered: Fixture[] = [];
                const now = Date.now() / 1000;

                if (activeTab === 'live') {
                    filtered = allFixtures.filter(f => ['1H', '2H', 'HT'].includes(f.fixture.status.short));
                } else if (activeTab === 'upcoming') {
                    filtered = allFixtures.filter(f => f.fixture.status.short === 'NS' && f.fixture.timestamp > now);
                } else if (activeTab === 'results') {
                    filtered = allFixtures.filter(f => ['FT', 'AET', 'PEN'].includes(f.fixture.status.short));
                }
                setFixtures(filtered);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    if (!league) return <ActivityIndicator style={styles.center} color={COLORS.primary} />;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                title: league.name,
                headerStyle: { backgroundColor: '#001f3f' },
                headerTintColor: '#fff',
            }} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <Image source={{ uri: league.logo }} style={styles.logo} resizeMode="contain" />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.title}>{league.name}</Text>
                    <View style={styles.subtitleRow}>
                        <Image source={{ uri: league.flag }} style={styles.flag} resizeMode="cover" />
                        <Text style={styles.subtitle}>{league.country} • {league.season}</Text>
                    </View>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
                    {(['live', 'upcoming', 'results', 'standings'] as Tab[]).map((tab) => (
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
                </ScrollView>
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {activeTab === 'standings' ? (
                        <StandingsTable standings={standings} />
                    ) : (
                        fixtures.length > 0 ? (
                            fixtures.map(f => (
                                <FixtureCard key={f.fixture.id} fixture={f} />
                            ))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No {activeTab} matches found</Text>
                            </View>
                        )
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        backgroundColor: 'rgba(0, 31, 63, 0.8)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    logoContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
        padding: 5,
    },
    logo: {
        width: 50,
        height: 50
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 4,
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    flag: {
        width: 20,
        height: 14,
        marginRight: 6,
        borderRadius: 2,
    },
    subtitle: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.md,
        fontWeight: '500',
    },
    tabsContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    tabsContent: {
        paddingHorizontal: SPACING.md,
    },
    tab: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginRight: 4,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.secondary,
    },
    tabText: {
        color: COLORS.textLight,
        fontWeight: '700',
        fontSize: FONT_SIZES.sm,
        letterSpacing: 0.5,
    },
    activeTabText: {
        color: '#fff',
    },
    content: {
        padding: SPACING.md,
    },
    emptyContainer: {
        padding: SPACING.xl,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.md,
        fontStyle: 'italic',
    }
});
