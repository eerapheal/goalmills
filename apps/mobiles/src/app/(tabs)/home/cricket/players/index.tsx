import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';
import { advancedCricketApi } from '../../../../../services/advancedCricketApi';
import { CricketPlayer } from '@goalmills/types';

type RoleFilter = 'all' | 'batsman' | 'bowler' | 'all-rounder';

export default function CricketPlayersListScreen() {
    const router = useRouter();
    const [players, setPlayers] = useState<CricketPlayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<RoleFilter>('all');

    useEffect(() => {
        const loadPlayers = async () => {
            try {
                setLoading(true);
                const res = await advancedCricketApi.getPlayers();
                setPlayers(res.result || []);
            } catch (error) {
                console.error('Error loading mobile players directory:', error);
            } finally {
                setLoading(false);
            }
        };
        loadPlayers();
    }, []);

    const filteredPlayers = useMemo(() => {
        return players.filter((p) => {
            const nameMatch = p.player_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.player_country && p.player_country.toLowerCase().includes(searchQuery.toLowerCase()));

            if (!nameMatch) return false;
            if (selectedRole === 'all') return true;
            const role = (p.player_type || p.player_role || '').toLowerCase();
            return role.includes(selectedRole);
        });
    }, [players, searchQuery, selectedRole]);

    const renderPlayerCard = ({ item }: { item: CricketPlayer }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/home/cricket/players/${item.player_key}`)}
        >
            <View style={styles.avatar}>
                {item.player_image ? (
                    <Image source={{ uri: item.player_image }} style={styles.avatarImage} />
                ) : (
                    <Text style={styles.avatarText}>{item.player_name.charAt(0)}</Text>
                )}
            </View>
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.player_name}</Text>
                <Text style={styles.role}>{item.player_type || item.player_role || 'Athlete'}</Text>
                <Text style={styles.country}>{item.player_country || 'International'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Cricket Athletes',
                    headerStyle: { backgroundColor: '#0a0e27' },
                    headerTintColor: '#fff',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                    ),
                }}
            />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={18} color="rgba(255,255,255,0.4)" style={styles.searchIcon} />
                <TextInput
                    placeholder="Search player, country..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInput}
                />
            </View>

            {/* Role Filter Chips */}
            <View style={styles.filterRow}>
                {[
                    { id: 'all', label: 'All' },
                    { id: 'batsman', label: 'Batters' },
                    { id: 'bowler', label: 'Bowlers' },
                    { id: 'all-rounder', label: 'All-Rounders' },
                ].map((chip) => (
                    <TouchableOpacity
                        key={chip.id}
                        style={[styles.filterChip, selectedRole === chip.id && styles.filterChipActive]}
                        onPress={() => setSelectedRole(chip.id as RoleFilter)}
                    >
                        <Text style={[styles.filterChipText, selectedRole === chip.id && styles.filterChipTextActive]}>
                            {chip.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.secondary} />
                </View>
            ) : (
                <FlatList
                    data={filteredPlayers}
                    renderItem={renderPlayerCard}
                    keyExtractor={(item) => item.player_key}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No athletes matching current search criteria.</Text>
                        </View>
                    }
                />
            )}
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
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: BORDER_RADIUS.lg,
        marginHorizontal: SPACING.md,
        marginTop: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    searchIcon: {
        marginRight: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: FONT_SIZES.sm,
        paddingVertical: 10,
        fontWeight: '700',
    },
    filterRow: {
        flexDirection: 'row',
        gap: 6,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
    },
    filterChipActive: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    filterChipText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    listContent: {
        padding: SPACING.md,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.secondary,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        color: COLORS.secondary,
        fontSize: 20,
        fontWeight: '900',
    },
    info: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    name: {
        color: '#fff',
        fontSize: FONT_SIZES.sm,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    role: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    country: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 10,
        fontWeight: '600',
        marginTop: 1,
    },
    emptyContainer: {
        padding: SPACING.xxl,
        alignItems: 'center',
    },
    emptyText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: FONT_SIZES.xs,
        fontWeight: '700',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
});
