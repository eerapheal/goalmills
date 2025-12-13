import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { footballApi } from '../../services/footballApi';
import { League } from '@goalmills/types';
import { Stack } from 'expo-router';
import { SvgUri } from 'react-native-svg';

export default function RegionsScreen() {
    const [regions, setRegions] = useState<{ name: string, flag: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        footballApi.getLeagues().then((data) => {
            const uniqueRegions: Record<string, string> = {};
            data.forEach(l => {
                if (!uniqueRegions[l.country]) {
                    uniqueRegions[l.country] = l.flag;
                }
            });

            setRegions(Object.keys(uniqueRegions).map(key => ({
                name: key,
                flag: uniqueRegions[key]
            })));
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
            <Stack.Screen options={{ title: 'Regions' }} />
            <FlatList
                data={regions}
                keyExtractor={(item) => item.name}
                numColumns={3}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.item}
                        // For now, no specific region details page, maybe filter leagues by region?
                        // User just said "make... region... pages". 
                        // I'll make a placeholder region details page or just not link yet 
                        // asking for clarification, but safer to link to a filter page.
                        // For now, let's link to a region details page.
                        onPress={() => router.push({ pathname: '/regions/[id]', params: { id: item.name } })}
                    >
                        {/* Svg might need care, using Image for simplicity if API returns png/svg that Image handles or SvgUri from react-native-svg */}
                        {/* The api returns .svg urls. react-native Image doesn't support svg directly usually without library. */}
                        {/* I see react-native-svg in package.json. I should use SvgUri. */}
                        <View style={styles.flagContainer}>
                            {item.flag.endsWith('.svg') ? (
                                <SvgUri uri={item.flag} width="100%" height="100%" />
                            ) : (
                                <Image source={{ uri: item.flag }} style={styles.flag} resizeMode="contain" />
                            )}
                        </View>
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
    flagContainer: { width: 60, height: 40, marginBottom: 8, overflow: 'hidden' },
    flag: { width: '100%', height: '100%' },
    name: { fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center' },
});
