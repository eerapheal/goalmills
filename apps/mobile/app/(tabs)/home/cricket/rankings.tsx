import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';

// Mock Rankings Data
const rankingsData = {
    test: [
        { rank: 1, team: 'Australia', points: 124, rating: 124, logo: 'https://flagcdn.com/w320/au.png' },
        { rank: 2, team: 'India', points: 120, rating: 120, logo: 'https://flagcdn.com/w320/in.png' },
        { rank: 3, team: 'England', points: 105, rating: 105, logo: 'https://flagcdn.com/w320/gb-eng.png' },
        { rank: 4, team: 'South Africa', points: 103, rating: 103, logo: 'https://flagcdn.com/w320/za.png' },
        { rank: 5, team: 'New Zealand', points: 96, rating: 96, logo: 'https://flagcdn.com/w320/nz.png' },
    ],
    odi: [
        { rank: 1, team: 'India', points: 118, rating: 118, logo: 'https://flagcdn.com/w320/in.png' },
        { rank: 2, team: 'Australia', points: 113, rating: 113, logo: 'https://flagcdn.com/w320/au.png' },
        { rank: 3, team: 'Pakistan', points: 109, rating: 109, logo: 'https://flagcdn.com/w320/pk.png' },
        { rank: 4, team: 'South Africa', points: 106, rating: 106, logo: 'https://flagcdn.com/w320/za.png' },
        { rank: 5, team: 'New Zealand', points: 101, rating: 102, logo: 'https://flagcdn.com/w320/nz.png' },
    ],
    t20: [
        { rank: 1, team: 'India', points: 264, rating: 264, logo: 'https://flagcdn.com/w320/in.png' },
        { rank: 2, team: 'Australia', points: 257, rating: 257, logo: 'https://flagcdn.com/w320/au.png' },
        { rank: 3, team: 'England', points: 252, rating: 252, logo: 'https://flagcdn.com/w320/gb-eng.png' },
        { rank: 4, team: 'West Indies', points: 252, rating: 252, logo: 'https://flagcdn.com/w320/bb.png' },
        { rank: 5, team: 'New Zealand', points: 250, rating: 250, logo: 'https://flagcdn.com/w320/nz.png' },
    ],
};

type Format = 'test' | 'odi' | 't20';

export default function CricketRankingsScreen() {
    const router = useRouter();
    const [activeFormat, setActiveFormat] = useState<Format>('test');

    const renderTable = () => (
        <View style={styles.table}>
            <View style={styles.tableHeader}>
                <Text style={[styles.headText, { flex: 1 }]}>Rank</Text>
                <Text style={[styles.headText, { flex: 4 }]}>Team</Text>
                <Text style={[styles.headText, { flex: 2, textAlign: 'right' }]}>Rating</Text>
                <Text style={[styles.headText, { flex: 2, textAlign: 'right' }]}>Points</Text>
            </View>
            {rankingsData[activeFormat].map((item) => (
                <View key={item.team} style={styles.row}>
                    <Text style={[styles.cellText, { flex: 1, fontWeight: '700' }]}>{item.rank}</Text>
                    <View style={{ flex: 4, flexDirection: 'row', alignItems: 'center' }}>
                        <Image source={{ uri: item.logo }} style={styles.teamLogo} />
                        <Text style={styles.cellText}>{item.team}</Text>
                    </View>
                    <Text style={[styles.cellText, { flex: 2, textAlign: 'right' }]}>{item.rating}</Text>
                    <Text style={[styles.cellText, { flex: 2, textAlign: 'right' }]}>{item.points}</Text>
                </View>
            ))}
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
    teamLogo: {
        width: 24,
        height: 16,
        marginRight: SPACING.sm,
        borderRadius: 2,
    },
});
