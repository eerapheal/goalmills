import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';
import { CricketStanding } from '@goalmills/types';
import { advancedCricketApi } from '../../../../services/advancedCricketApi';

type Format = 'test' | 'odi' | 't20';

const LEAGUE_IDS: Record<Format, number> = {
    test: 101,
    odi: 102,
    t20: 103,
};

export default function CricketRankingsScreen() {
    const router = useRouter();
    const [activeFormat, setActiveFormat] = useState<Format>('test');
    const [loading, setLoading] = useState(false);
    const [standings, setStandings] = useState<CricketStanding[]>([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const response = await advancedCricketApi.getStandings({
                    leagueId: LEAGUE_IDS[activeFormat],
                    APIkey: 'mock'
                });
                if (response.result && response.result.total) {
                    setStandings(response.result.total);
                } else {
                    setStandings([]);
                }
            } catch (error) {
                console.error('Error loading rankings:', error);
                setStandings([]);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [activeFormat]);

    const renderTable = () => (
        <View style={styles.table}>
            <View style={styles.tableHeader}>
                <Text style={[styles.headText, { flex: 1 }]}>Rank</Text>
                <Text style={[styles.headText, { flex: 4 }]}>Team</Text>
                <Text style={[styles.headText, { flex: 2, textAlign: 'right' }]}>Rating</Text>
                <Text style={[styles.headText, { flex: 2, textAlign: 'right' }]}>Points</Text>
            </View>
            {loading ? (
                <ActivityIndicator size="small" color={COLORS.secondary} style={{ padding: 20 }} />
            ) : standings.length > 0 ? (
                standings.map((item) => (
                    <View key={item.team_key} style={styles.row}>
                        <Text style={[styles.cellText, { flex: 1, fontWeight: '700' }]}>{item.standing_place}</Text>
                        <View style={{ flex: 4, flexDirection: 'row', alignItems: 'center' }}>
                            {/* Logo not available in CricketStanding, using placeholder or rely on name */}
                            <View style={styles.teamLogoPlaceholder}>
                                <Text style={styles.teamLogoText}>{item.standing_team.charAt(0)}</Text>
                            </View>
                            <Text style={styles.cellText}>{item.standing_team}</Text>
                        </View>
                        <Text style={[styles.cellText, { flex: 2, textAlign: 'right' }]}>{item.standing_NRR || '-'}</Text>
                        {/* Note: NRR used as placeholder for Rating if not available, or Pts */}
                        <Text style={[styles.cellText, { flex: 2, textAlign: 'right' }]}>{item.standing_Pts}</Text>
                    </View>
                ))
            ) : (
                <Text style={styles.emptyText}>No rankings available for this format.</Text>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'ICC Rankings',
                    headerStyle: { backgroundColor: COLORS.backgroundDark },
                    headerTintColor: COLORS.background,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.background} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <View style={styles.tabs}>
                {(['test', 'odi', 't20'] as Format[]).map((format) => (
                    <TouchableOpacity
                        key={format}
                        style={[styles.tab, activeFormat === format && styles.activeTab]}
                        onPress={() => setActiveFormat(format)}
                    >
                        <Text style={[styles.tabText, activeFormat === format && styles.activeTabText]}>
                            {format.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Men's Team Rankings - {activeFormat.toUpperCase()}</Text>
                {renderTable()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.md,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    tab: {
        paddingVertical: SPACING.md,
        marginRight: SPACING.lg,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.secondary,
    },
    tabText: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
    },
    activeTabText: {
        color: COLORS.background,
    },
    content: {
        padding: SPACING.md,
    },
    title: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.background,
        marginBottom: SPACING.md,
    },
    table: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: SPACING.xs,
    },
    headText: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    cellText: {
        color: COLORS.background,
        fontSize: FONT_SIZES.sm,
    },
    teamLogoPlaceholder: {
        width: 24,
        height: 24,
        marginRight: SPACING.sm,
        borderRadius: 12,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    teamLogoText: {
        color: COLORS.backgroundDark,
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyText: {
        color: COLORS.textLight,
        textAlign: 'center',
        padding: SPACING.md,
        fontStyle: 'italic',
    },
});
