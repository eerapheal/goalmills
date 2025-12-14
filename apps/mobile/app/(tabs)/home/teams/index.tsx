import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { footballApi } from '../../../../services/footballApi';
import { Team } from '@goalmills/types';
import { Stack } from 'expo-router';

export default function TeamsScreen() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        footballApi.getTeams().then((data) => {
            setTeams(data);
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
            <Stack.Screen options={{ title: 'Teams' }} />
            <FlatList
                data={teams}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => router.push(`/home/teams/${item.id}`)}
                    >
                        <Image source={{ uri: item.logo }} style={styles.logo} resizeMode="contain" />
                        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 8 },
    item: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        margin: 8,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    logo: { width: 60, height: 60, marginBottom: 8 },
    name: { fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center' },
});
