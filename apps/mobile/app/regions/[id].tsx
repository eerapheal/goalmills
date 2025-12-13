import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { footballApi } from '../../services/footballApi';
import { League } from '@goalmills/types';

export default function RegionDetails() {
    const { id } = useLocalSearchParams(); // id is country name
    const [leagues, setLeagues] = useState<League[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        footballApi.getLeagues().then((data) => {
            const filtered = data.filter(l => l.country === id);
            setLeagues(filtered);
            setLoading(false);
        });
    }, [id]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: id as string }} />
            <Text style={styles.header}>Leagues in {id}</Text>
            <FlatList
                data={leagues}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => router.push(`/leagues/${item.id}`)}
                    >
                        <Text style={styles.name}>{item.name}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.empty}>No leagues found for this region.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5', padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
    item: {
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        borderRadius: 8,
        marginBottom: 8
    },
    name: { fontSize: 16, fontWeight: '600' },
    empty: { textAlign: 'center', color: '#666', marginTop: 20 }
});
