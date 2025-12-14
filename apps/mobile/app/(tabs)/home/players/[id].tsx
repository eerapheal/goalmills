import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { footballApi } from '../../../../services/footballApi';

interface MPlayer {
    id: number;
    name: string;
    team: string;
    position: string;
    number: number;
    photo: string;
}

export default function PlayerDetails() {
    const { id } = useLocalSearchParams();
    const [player, setPlayer] = useState<MPlayer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            footballApi.getPlayerById(Number(id)).then(p => {
                setPlayer(p);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading || !player) return <ActivityIndicator style={styles.center} />;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: player.name }} />

            <View style={styles.header}>
                <Image source={{ uri: player.photo }} style={styles.photo} resizeMode="contain" />
                <Text style={styles.name}>{player.name}</Text>
                <Text style={styles.team}>{player.team}</Text>
                <View style={styles.badges}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>#{player.number}</Text>
                    </View>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{player.position}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.stats}>
                {/* Placeholder stats */}
                <Text style={styles.statsTitle}>Season Stats</Text>
                <View style={styles.statRow}>
                    <Text>Appearances</Text>
                    <Text style={styles.statValue}>18</Text>
                </View>
                <View style={styles.statRow}>
                    <Text>Goals</Text>
                    <Text style={styles.statValue}>{player.position === 'Forward' ? Math.floor(Math.random() * 15) : Math.floor(Math.random() * 5)}</Text>
                </View>
                <View style={styles.statRow}>
                    <Text>Assists</Text>
                    <Text style={styles.statValue}>{Math.floor(Math.random() * 10)}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { alignItems: 'center', padding: 32, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
    photo: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#eee', marginBottom: 16 },
    name: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
    team: { fontSize: 18, color: '#666', marginBottom: 16 },
    badges: { flexDirection: 'row', gap: 12 },
    badge: { backgroundColor: '#e1effe', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
    badgeText: { color: '#007AFF', fontWeight: '600' },
    stats: { padding: 16, backgroundColor: 'white', marginTop: 16 },
    statsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    statValue: { fontWeight: '700' }
});
