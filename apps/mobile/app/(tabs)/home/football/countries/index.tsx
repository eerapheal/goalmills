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
import { FootballCountry } from '@goalmills/types';
import { advancedFootballApi } from '../../../../../services/advancedFootballApi';

export default function FootballCountriesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [countries, setCountries] = useState<FootballCountry[]>([]);
    const [filteredCountries, setFilteredCountries] = useState<FootballCountry[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCountries();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredCountries(countries);
        } else {
            const filtered = countries.filter((country) =>
                country.country_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredCountries(filtered);
        }
    }, [searchQuery, countries]);

    const loadCountries = async () => {
        try {
            const response = await advancedFootballApi.getCountries();
            setCountries(response.result);
            setFilteredCountries(response.result);
        } catch (error) {
            console.error('Error loading countries:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.secondary} />
                <Text style={styles.loadingText}>Loading countries...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>🌍 Football Countries</Text>
                <Text style={styles.headerSubtitle}>
                    {filteredCountries.length} countr{filteredCountries.length !== 1 ? 'ies' : 'y'}
                </Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search countries..."
                    placeholderTextColor={COLORS.textLight}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Countries List */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {filteredCountries.map((country) => (
                    <Pressable
                        key={country.country_key}
                        style={({ pressed }) => [styles.countryCard, pressed && styles.pressed]}
                        onPress={() => router.push(`/home/football/countries/${country.country_key}` as any)}
                    >
                        <View style={styles.countryInfo}>
                            {country.country_logo && (
                                <Image source={{ uri: country.country_logo }} style={styles.countryFlag} />
                            )}
                            <View style={styles.countryText}>
                                <Text style={styles.countryName}>{country.country_name}</Text>
                                {country.country_iso2 && (
                                    <Text style={styles.countryCode}>{country.country_iso2}</Text>
                                )}
                            </View>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </Pressable>
                ))}

                {filteredCountries.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No countries found</Text>
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
    countryCard: {
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
    countryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    countryFlag: {
        width: 48,
        height: 48,
        marginRight: SPACING.md,
        borderRadius: BORDER_RADIUS.sm,
    },
    countryText: {
        flex: 1,
    },
    countryName: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.background,
        marginBottom: SPACING.xs,
    },
    countryCode: {
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
