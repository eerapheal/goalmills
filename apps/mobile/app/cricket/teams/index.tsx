import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { CricketTeam } from '@goalmills/types';
import { cricketApi } from '../../../services/cricketApi';
import { Ionicons } from '@expo/vector-icons';

export default function CricketTeamsListScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState<CricketTeam[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await cricketApi.getTeams();
                setTeams(response.teams);
            } catch (error) {
                console.error('Error loading teams:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const renderItem = ({ item }: { item: CricketTeam }) => (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/cricket/teams/${item.id}`)}>
            <Image source={{ uri: item.logo }} style={styles.logo} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.country}>{item.country || 'International'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Teams',
                    headerStyle: { backgroundColor: COLORS.backgroundDark },
                    headerTintColor: COLORS.text,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    ),
                }}
            />
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.secondary} />
                </View>
            ) : (
                <FlatList
                    data={teams}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                />
            )}
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
    },
    listContent: {
        padding: SPACING.md,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    info: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    name: {
        color: COLORS.background,
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
    },
    country: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.sm,
    },
});
