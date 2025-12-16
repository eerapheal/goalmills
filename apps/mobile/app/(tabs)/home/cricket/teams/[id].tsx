import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { CricketTeam } from '@goalmills/types';
import { advancedCricketApi } from '../../../../../services/advancedCricketApi';
import { Ionicons } from '@expo/vector-icons';

export default function CricketTeamDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState<CricketTeam | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                const teamRes = await advancedCricketApi.getTeams({ teamId: Number(id), APIkey: 'mock' });
                if (teamRes.result && teamRes.result.length > 0) {
                    // API returns array, we filter or take first if filtered by ID
                    setTeam(teamRes.result[0]);
                }
            } catch (error) {
                console.error('Error loading team details:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) return <View style={styles.loadingContainer}><ActivityIndicator color={COLORS.secondary} size="large" /></View>;
    if (!team) return <View style={styles.container}><Text style={styles.errorText}>Team not found</Text></View>;

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: team.team_name,
                    headerStyle: { backgroundColor: COLORS.backgroundDark },
                    headerTintColor: COLORS.text,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Image source={{ uri: team.team_logo || 'https://example.com/placeholder.png' }} style={styles.logo} />
                    <Text style={styles.name}>{team.team_name}</Text>
                    {/* <Text style={styles.country}>{team.country}</Text> Country not available */}
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.emptyText}>Squad information is currently not available via the API.</Text>
                </View>
            </ScrollView>
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
        alignItems: 'center',
        marginBottom: SPACING.xl,
        padding: SPACING.lg,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: BORDER_RADIUS.lg,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: SPACING.md,
    },
    name: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '800',
        color: COLORS.background,
        marginBottom: SPACING.xs,
    },
    country: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textLight,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.secondary,
        marginBottom: SPACING.md,
        marginTop: SPACING.md,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
    },
    playerImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    playerInfo: {
        marginLeft: SPACING.md,
    },
    playerName: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.background,
    },
    playerRole: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textLight,
        marginTop: 2,
    },
    errorText: {
        color: COLORS.danger,
        fontSize: FONT_SIZES.md,
        textAlign: 'center',
        marginTop: SPACING.xl,
    },
    emptyText: {
        color: COLORS.textLight,
        fontStyle: 'italic',
    },
});
