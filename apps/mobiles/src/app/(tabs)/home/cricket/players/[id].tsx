import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';

export default function CricketPlayerDetailsScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Player Details',
                    headerStyle: { backgroundColor: COLORS.backgroundDark },
                    headerTintColor: COLORS.background,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.background} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <View style={styles.loadingContainer}>
                <Text style={styles.emptyText}>Player information is currently not available via the API.</Text>
            </View>
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
        backgroundColor: COLORS.backgroundDark,
    },
    content: {
        padding: SPACING.md,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: SPACING.md,
    },
    name: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '800',
        color: COLORS.background,
        marginBottom: SPACING.xs,
    },
    role: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.secondary,
        textTransform: 'uppercase',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.background,
        marginBottom: SPACING.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    label: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.md,
    },
    value: {
        color: COLORS.background,
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
    },
    errorText: {
        color: COLORS.danger,
        fontSize: FONT_SIZES.md,
        textAlign: 'center',
        marginTop: SPACING.xl,
    },
    emptyText: {
        color: COLORS.textLight,
        fontStyle: 'italic',
    },
});
