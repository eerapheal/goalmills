import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { footballApi } from '../../services/footballApi';
import { Team, Fixture } from '@goalmills/types';
import { FixtureCard } from '../../components/FixtureCard';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';

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

    if (loading || !team) return <ActivityIndicator style={styles.center} color={COLORS.primary} />;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                title: team.name,
                headerStyle: { backgroundColor: '#001f3f' },
                headerTintColor: '#fff',
            }} />

            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <Image source={{ uri: team.logo }} style={styles.logo} resizeMode="contain" />
                </View>
                <Text style={styles.title}>{team.name}</Text>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Matches</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {fixtures.length > 0 ? (
                    fixtures.map(f => (
                        <FixtureCard key={f.fixture.id} fixture={f} />
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No matches found</Text>
                    </View>
                )}
            </ScrollView>
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
        alignItems: 'center',
        padding: SPACING.xl,
        backgroundColor: 'rgba(0, 31, 63, 0.8)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: SPACING.md,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
        padding: 10,
    },
    logo: {
        width: 70,
        height: 70,
    },
    title: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '900',
        color: '#fff',
    },
    sectionHeader: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.sm,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.secondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    content: {
        padding: SPACING.md
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
