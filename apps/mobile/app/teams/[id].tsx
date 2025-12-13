import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { footballApi } from '../../services/footballApi';
import { Team, Fixture } from '@goalmills/types';
import { FixtureCard } from '../../components/FixtureCard';

export default function TeamDetails() {
    const { id } = useLocalSearchParams();
    const [team, setTeam] = useState<Team | null>(null);
    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            const [teamData, fixturesData] = await Promise.all([
                footballApi.getTeamById(Number(id)),
                footballApi.getFixturesByTeam(Number(id))
            ]);
            setTeam(teamData);
            setFixtures(fixturesData);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    if (loading || !team) return <ActivityIndicator style={styles.center} />;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: team.name }} />

            <View style={styles.header}>
                <Image source={{ uri: team.logo }} style={styles.logo} resizeMode="contain" />
                <Text style={styles.title}>{team.name}</Text>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Matches</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {fixtures.map(f => (
                    <FixtureCard key={f.fixture.id} fixture={f} />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { alignItems: 'center', padding: 24, backgroundColor: 'white' },
    logo: { width: 80, height: 80, marginBottom: 12 },
    title: { fontSize: 24, fontWeight: '700' },
    sectionHeader: { padding: 16, paddingBottom: 8 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
    content: { padding: 8 }
});
