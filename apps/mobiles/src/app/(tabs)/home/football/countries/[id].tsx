import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { FootballCountry, FootballLeague } from '@goalmills/types';
import { advancedFootballApi } from '../../../../../services/advancedFootballApi';

export default function CountryDetailPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [country, setCountry] = useState<FootballCountry | null>(null);
    const [leagues, setLeagues] = useState<FootballLeague[]>([]);

    useEffect(() => {
        loadCountryData();
    }, [id]);

    const loadCountryData = async () => {
        try {
            const [countriesRes, leaguesRes] = await Promise.all([
                advancedFootballApi.getCountries(),
                advancedFootballApi.getLeagues(Number(id)),
            ]);

            const foundCountry = countriesRes.result.find((c) => c.country_key === id);
            setCountry(foundCountry || null);
            setLeagues(leaguesRes.result);
        } catch (error) {
            console.error('Error loading country data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.secondary} />
                <Text style={styles.loadingText}>Loading country details...</Text>
            </View>
        );
    }

    if (!country) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Country not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                {country.country_logo && (
                    <Image source={{ uri: country.country_logo }} style={styles.countryFlag} />
                )}
                <Text style={styles.countryName}>{country.country_name}</Text>
                {country.country_iso2 && (
                    <Text style={styles.countryCode}>{country.country_iso2}</Text>
                )}
            </View>

            {/* Leagues Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏆 Leagues ({leagues.length})</Text>
                {leagues.map((league) => (
                    <Pressable
                        key={league.league_key}
                        style={({ pressed }) => [styles.leagueCard, pressed && styles.pressed]}
                        onPress={() => router.push(`/home/football/leagues/${league.league_key}` as any)}
                    >
                        {league.league_logo && (
                            <Image source={{ uri: league.league_logo }} style={styles.leagueLogo} />
                        )}
                        <View style={styles.leagueInfo}>
                            <Text style={styles.leagueName}>{league.league_name}</Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </Pressable>
                ))}

                {leagues.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No leagues available</Text>
                    </View>
                )}
            </View>
        </ScrollView>
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundDark,
    },
    errorText: {
        fontSize: FONT_SIZES.lg,
        color: COLORS.danger,
    },
    header: {
        backgroundColor: 'rgba(0, 31, 63, 0.9)',
        padding: SPACING.xl,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: COLORS.secondary,
    },
    countryFlag: {
        width: 120,
        height: 120,
        marginBottom: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
    },
    countryName: {
        fontSize: FONT_SIZES.xxl + 4,
        fontWeight: '900',
        color: COLORS.background,
        marginBottom: SPACING.xs,
        textAlign: 'center',
    },
    countryCode: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    section: {
        padding: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '800',
        color: COLORS.background,
        marginBottom: SPACING.md,
    },
    leagueCard: {
        flexDirection: 'row',
        alignItems: 'center',
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
    leagueLogo: {
        width: 48,
        height: 48,
        marginRight: SPACING.md,
        borderRadius: BORDER_RADIUS.sm,
    },
    leagueInfo: {
        flex: 1,
    },
    leagueName: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.background,
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
        fontSize: FONT_SIZES.md,
        color: COLORS.textLight,
    },
});
