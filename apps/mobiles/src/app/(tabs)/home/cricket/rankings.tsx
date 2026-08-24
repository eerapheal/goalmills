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
                    leagueId: LEAGUE_IDS[activeFormat]
                });

                // Safe extraction logic matching web
                const data = response.result?.total || (Array.isArray(response.result) ? response.result : []);
                setStandings(data);
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
                <Text style={[styles.headText, { flex: 0.8 }]}>Pos</Text>
                <Text style={[styles.headText, { flex: 4 }]}>Team</Text>
                <Text style={[styles.headText, { flex: 1.5, textAlign: 'right' }]}>Pts</Text>
                <Text style={[styles.headText, { flex: 1.5, textAlign: 'right' }]}>NRR</Text>
            </View>
            {loading ? (
                <ActivityIndicator size="small" color={COLORS.secondary} style={{ padding: 40 }} />
            ) : standings.length > 0 ? (
                standings.map((item, idx) => (
                    <View key={item.team_key || idx} style={styles.row}>
                        <Text style={[styles.cellText, styles.rankPos]}>{item.standing_place}</Text>
                        <View style={{ flex: 4, flexDirection: 'row', alignItems: 'center' }}>
                            <View style={styles.teamLogoPlaceholder}>
                                <Text style={styles.teamLogoText}>{(item.standing_team || '?').charAt(0)}</Text>
                            </View>
                            <Text style={[styles.cellText, styles.teamName]} numberOfLines={1}>{item.standing_team}</Text>
                        </View>
                        <Text style={[styles.cellText, styles.points]}>{item.standing_Pts}</Text>
                        <Text style={[styles.cellText, styles.nrr, parseFloat(item.standing_NRR) >= 0 ? styles.positive : styles.negative]}>
                            {item.standing_NRR || '-'}
                        </Text>
                    </View>
                ))
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>SEASON INITIALIZING</Text>
                    <Text style={styles.emptyText}>Elite Intel Pending</Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'ICC Rankings',
                    headerStyle: { backgroundColor: '#0a0e27' },
                    headerTintColor: '#fff',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                    ),
                }}
            />

            <View style={styles.headerSection}>
                <Text style={styles.bgTitle}>ICC RANKINGS</Text>
                <Text style={styles.subTitle}>OFFICIAL STANDINGS</Text>
            </View>

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
                {renderTable()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0e27',
    },
    headerSection: {
        padding: 24,
        paddingBottom: 0,
    },
    bgTitle: {
        color: 'rgba(255, 255, 255, 0.05)',
        fontSize: 40,
        fontWeight: '900',
        position: 'absolute',
        top: 10,
        left: 20,
        fontStyle: 'italic',
    },
    subTitle: {
        color: COLORS.secondary,
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
        marginTop: 40,
        marginBottom: 20,
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 16,
    },
    tab: {
        paddingVertical: 16,
        marginRight: 24,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.secondary,
    },
    tabText: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
    },
    activeTabText: {
        color: '#fff',
    },
    content: {
        padding: 16,
        paddingTop: 0,
    },
    table: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    tableHeader: {
        flexDirection: 'row',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 8,
    },
    headText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.03)',
    },
    cellText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    rankPos: {
        flex: 0.8,
        color: 'rgba(255, 255, 255, 0.5)',
        fontWeight: '900',
    },
    teamName: {
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    points: {
        flex: 1.5,
        textAlign: 'right',
        fontWeight: '900',
    },
    nrr: {
        flex: 1.5,
        textAlign: 'right',
        fontSize: 10,
        fontWeight: '700',
    },
    positive: { color: '#10b981' },
    negative: { color: '#f43f5e' },
    teamLogoPlaceholder: {
        width: 24,
        height: 24,
        marginRight: 10,
        borderRadius: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    teamLogoText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        color: 'rgba(255, 255, 255, 0.2)',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 8,
    },
    emptyText: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
});

