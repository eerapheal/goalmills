import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { footballApi } from '../../services/footballApi';
import { League, Fixture, Standing } from '@goalmills/types';
import { FixtureCard } from '../../components/FixtureCard';
import { StandingsTable } from '../../components/StandingsTable';

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
                // Fetch specific fixtures based on tab
                // Note: The API doesn't perfectly support filtering by status AND league in one go in our mock, 
                // so we fetch all by league and filter client side for better mock experience, 
                // OR we use the specific methods if possible.
                // footballApi.getFixturesByLeague fetches all for the league.
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

    if (!league) return <ActivityIndicator style={styles.center} />;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: league.name }} />

            {/* Header */}
            <View style={styles.header}>
                <Image source={{ uri: league.logo }} style={styles.logo} resizeMode="contain" />
                <View>
                    <Text style={styles.title}>{league.name}</Text>
                    <Text style={styles.subtitle}>{league.country} • {league.season}</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                {(['live', 'upcoming', 'results', 'standings'] as Tab[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} />
            ) : (
                <ScrollView contentContainerStyle={styles.content}>
                    {activeTab === 'standings' ? (
                        <StandingsTable standings={standings} />
                    ) : (
                        fixtures.length > 0 ? (
                            fixtures.map(f => (
                                <FixtureCard key={f.fixture.id} fixture={f} />
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No {activeTab} matches found</Text>
                        )
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        marginBottom: 8
    },
    logo: { width: 60, height: 60, marginRight: 16 },
    title: { fontSize: 20, fontWeight: '700' },
    subtitle: { color: '#666', marginTop: 4 },
    tabs: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent'
    },
    activeTab: { borderBottomColor: '#007AFF' },
    tabText: { color: '#666', fontWeight: '600' },
    activeTabText: { color: '#007AFF' },
    content: { padding: 8 },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#666' }
});
