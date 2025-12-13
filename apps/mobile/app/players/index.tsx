import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { footballApi } from '../../services/footballApi';

// Mock Players type since we added it to api but maybe not types package
interface MPlayer {
    id: number;
    name: string;
    team: string;
    position: string;
    number: number;
    photo: string;
}

export default function PlayersScreen() {
    const [players, setPlayers] = useState<MPlayer[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        footballApi.getPlayers().then((data) => {
            setPlayers(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Players' }} />
            <FlatList
                data={players}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => router.push(`/players/${item.id}`)}
                    >
                        <Image source={{ uri: item.photo }} style={styles.photo} resizeMode="cover" />
                        <View>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.subtitle}>{item.team} • {item.position}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    photo: { width: 50, height: 50, borderRadius: 25, marginRight: 16, backgroundColor: '#eee' },
    name: { fontSize: 16, fontWeight: '600', color: '#333' },
    subtitle: { fontSize: 14, color: '#666' }
});
