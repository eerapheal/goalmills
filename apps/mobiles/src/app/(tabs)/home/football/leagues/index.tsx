import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Pressable,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { FootballLeague } from '@goalmills/types';
import { advancedFootballApi } from '../../../../../services/advancedFootballApi';

export default function FootballLeaguesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [leagues, setLeagues] = useState<FootballLeague[]>([]);
    const [filteredLeagues, setFilteredLeagues] = useState<FootballLeague[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadLeagues();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredLeagues(leagues);
        } else {
            const filtered = leagues.filter(
                (league) =>
                    league.league_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    league.country_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredLeagues(filtered);
        }
    }, [searchQuery, leagues]);

    const loadLeagues = async () => {
        try {
            const response = await advancedFootballApi.getLeagues();
            setLeagues(response.result);
            setFilteredLeagues(response.result);
        } catch (error) {
            console.error('Error loading leagues:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.secondary} />
                <Text style={styles.loadingText}>Loading leagues...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>🏆 Football Leagues</Text>
                <Text style={styles.headerSubtitle}>
                    {filteredLeagues.length} league{filteredLeagues.length !== 1 ? 's' : ''}
                </Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search leagues or countries..."
                    placeholderTextColor={COLORS.textLight}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Leagues List */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {filteredLeagues.map((league) => (
                    <Pressable
                        key={league.league_key}
                        style={({ pressed }) => [styles.leagueCard, pressed && styles.pressed]}
                        onPress={() => router.push(`/home/football/leagues/${league.league_key}` as any)}
                    >
                        <View style={styles.leagueInfo}>
                            {league.league_logo && (
                                <Image source={{ uri: league.league_logo }} style={styles.leagueLogo} />
                            )}
                            <View style={styles.leagueText}>
                                <Text style={styles.leagueName}>{league.league_name}</Text>
                                <View style={styles.countryInfo}>
                                    {league.country_logo && (
                                        <Image source={{ uri: league.country_logo }} style={styles.countryFlag} />
                                    )}
                                    <Text style={styles.countryName}>{league.country_name}</Text>
                                </View>
                            </View>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </Pressable>
                ))}

                {filteredLeagues.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No leagues found</Text>
                        <Text style={styles.emptySubtext}>Try a different search term</Text>
                    </View>
                )}
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
    loadingText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textLight,
        marginTop: SPACING.md,
    },
    header: {
        backgroundColor: 'rgba(0, 31, 63, 0.9)',
        padding: SPACING.lg,
        borderBottomWidth: 3,
        borderBottomColor: COLORS.secondary,
    },
    headerTitle: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '900',
        color: COLORS.background,
        marginBottom: SPACING.xs,
    },
    headerSubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    searchContainer: {
        padding: SPACING.md,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    searchInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        fontSize: FONT_SIZES.md,
        color: COLORS.background,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: SPACING.md,
    },
    leagueCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    pressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    leagueInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    leagueLogo: {
        width: 48,
        height: 48,
        marginRight: SPACING.md,
        borderRadius: BORDER_RADIUS.sm,
    },
    leagueText: {
        flex: 1,
    },
    leagueName: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.background,
        marginBottom: SPACING.xs,
    },
    countryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countryFlag: {
        width: 20,
        height: 20,
        marginRight: SPACING.xs,
        borderRadius: BORDER_RADIUS.xs,
    },
    countryName: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
    },
    arrow: {
        fontSize: 32,
        color: COLORS.secondary,
        fontWeight: '300',
    },
    emptyState: {
        alignItems: 'center',
        padding: SPACING.xxl,
    },
    emptyText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.background,
        marginBottom: SPACING.xs,
    },
    emptySubtext: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
    },
});
