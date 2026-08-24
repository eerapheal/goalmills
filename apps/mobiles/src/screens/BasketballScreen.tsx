import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { basketballApi } from '../services/basketballApi';
import { BasketballEvent } from '@goalmills/types';
import { BasketballMatchCard } from '../components/BasketballMatchCard';

export default function BasketballScreen() {
    const [liveMatches, setLiveMatches] = useState<BasketballEvent[]>([]);
    const [upcomingMatches, setUpcomingMatches] = useState<BasketballEvent[]>([]);
    const [results, setResults] = useState<BasketballEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<'live' | 'upcoming' | 'results'>('live');

    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        try {
            setLoading(true);
            const today = new Date();
            const from = new Date(today);
            from.setDate(today.getDate() - 30);
            const to = new Date(today);
            to.setDate(today.getDate() + 30);

            const formatDate = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const fixturesRes = await basketballApi.getFixtures({
                from: formatDate(from),
                to: formatDate(to),
            });

            const rawFixtures = fixturesRes?.result || [];
            const live = rawFixtures.filter(m => m.event_live === '1');
            const upcoming = rawFixtures.filter(m => {
                const status = (m.event_status || '').toUpperCase();
                const isFinished = status === 'FINISHED' || status === 'FT';
                return m.event_live !== '1' && !isFinished;
            });
            const finished = rawFixtures.filter(m => {
                const status = (m.event_status || '').toUpperCase();
                return status === 'FINISHED' || status === 'FT';
            });

            setLiveMatches(live);
            setUpcomingMatches(upcoming);
            setResults(finished);
        } catch (error) {
            console.error('Error loading basketball matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderMatches = () => {
        let matches: BasketballEvent[] = [];
        if (selectedTab === 'live') matches = liveMatches;
        else if (selectedTab === 'upcoming') matches = upcomingMatches;
        else matches = results;

        if (matches.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        {selectedTab === 'live' ? 'No live matches' : selectedTab === 'upcoming' ? 'No upcoming matches' : 'No recent results'}
                    </Text>
                </View>
            );
        }

        return matches.map(match => (
            <BasketballMatchCard key={match.event_key} match={match} />
        ));
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f59e0b" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>🏀 Basketball</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'live' && styles.activeTab]}
                    onPress={() => setSelectedTab('live')}
                >
                    <Text style={[styles.tabText, selectedTab === 'live' && styles.activeTabText]}>
                        Live {liveMatches.length > 0 && `(${liveMatches.length})`}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'upcoming' && styles.activeTab]}
                    onPress={() => setSelectedTab('upcoming')}
                >
                    <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.activeTabText]}>
                        Upcoming
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'results' && styles.activeTab]}
                    onPress={() => setSelectedTab('results')}
                >
                    <Text style={[styles.tabText, selectedTab === 'results' && styles.activeTabText]}>
                        Results
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Matches List */}
            <ScrollView style={styles.matchesList} showsVerticalScrollIndicator={false}>
                {renderMatches()}
            </ScrollView>
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
        backgroundColor: '#0a0e27',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
        paddingTop: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#1a1f3a',
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#f59e0b',
    },
    tabText: {
        color: '#8b92b0',
        fontSize: 14,
        fontWeight: '600',
    },
    activeTabText: {
        color: '#fff',
    },
    matchesList: {
        flex: 1,
        paddingHorizontal: 16,
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        color: '#8b92b0',
        fontSize: 14,
    },
});
