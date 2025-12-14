import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { footballApi } from '../../../../services/footballApi';
import { League } from '@goalmills/types';
import { Stack } from 'expo-router';

export default function CompetitionsScreen() {
    const [leagues, setLeagues] = useState<League[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        footballApi.getLeagues().then((data) => {
            setLeagues(data);
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
            <Stack.Screen options={{ title: 'Competitions' }} />
            <FlatList
                data={leagues}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => router.push(`/home/leagues/${item.id}`)}
                    >
                        {/* Reusing league details for now as competitions are usually leagues */}
                        <Image source={{ uri: item.logo }} style={styles.logo} resizeMode="contain" />
                        <Text style={styles.name}>{item.name}</Text>
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
        borderBottomColor: '#eee',
        marginHorizontal: 16,
        marginVertical: 4,
        borderRadius: 8,
    },
    logo: { width: 40, height: 40, marginRight: 16 },
    name: { fontSize: 16, fontWeight: '600', color: '#333' },
});
