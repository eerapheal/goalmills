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
                const teamRes = await advancedCricketApi.getTeams({ teamId: Number(id) });
                if (teamRes.result && teamRes.result.length > 0) {
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
                    headerStyle: { backgroundColor: '#0a0e27' },
                    headerTintColor: '#fff',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                    ),
                }}
            />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        {team.team_logo ? (
                            <Image source={{ uri: team.team_logo }} style={styles.logo} />
                        ) : (
                            <Text style={styles.logoText}>{team.team_name.charAt(0)}</Text>
                        )}
                    </View>
                    <Text style={styles.name}>{team.team_name}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>PROFESSIONAL CLUB</Text>
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>SQUAD MANIFEST</Text>
                    <View style={styles.emptyState}>
                        <Ionicons name="shield-outline" size={48} color="rgba(255,255,255,0.1)" />
                        <Text style={styles.emptyTitle}>SQUAD INTEL RESTRICTED</Text>
                        <Text style={styles.emptyText}>Roster details are currently classified.</Text>
                    </View>
                </View>
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0e27',
    },
    content: {
        padding: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        padding: 32,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    logo: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
    },
    logoText: {
        fontSize: 40,
        fontWeight: '900',
        color: COLORS.secondary,
    },
    name: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    badge: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
    },
    badgeText: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    sectionContainer: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: COLORS.secondary,
        marginBottom: 16,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    emptyTitle: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 11,
        textAlign: 'center',
    },
    errorText: {
        color: '#f43f5e',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 40,
    },
});
