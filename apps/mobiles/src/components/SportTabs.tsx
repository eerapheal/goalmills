import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { SportType } from '@goalmills/types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';

interface SportTabsProps {
    selectedSport: SportType;
    onSelectSport: (sport: SportType) => void;
}

const sports: { type: SportType; name: string; emoji: string }[] = [
    { type: 'football', name: 'Football', emoji: '⚽' },
    { type: 'cricket', name: 'Cricket', emoji: '🏏' },
    { type: 'tennis', name: 'Tennis', emoji: '🎾' },
    { type: 'basketball', name: 'Basketball', emoji: '🏀' },
    { type: 'baseball', name: 'Baseball', emoji: '⚾' },
    { type: 'hockey', name: 'Hockey', emoji: '🏒' },
];

export function SportTabs({ selectedSport, onSelectSport }: SportTabsProps) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
            style={styles.scrollView}
        >
            {sports.map((sport) => (
                <Pressable
                    key={sport.type}
                    style={({ pressed }) => [
                        styles.tab,
                        selectedSport === sport.type && styles.activeTab,
                        pressed && styles.pressedTab,
                    ]}
                    onPress={() => onSelectSport(sport.type)}
                >
                    <Text style={styles.emoji}>{sport.emoji}</Text>
                    <Text
                        style={[
                            styles.tabText,
                            selectedSport === sport.type && styles.activeTabText,
                        ]}
                    >
                        {sport.name}
                    </Text>
                </Pressable>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flexGrow: 0,
    },
    container: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        gap: SPACING.sm,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 2,
        borderColor: 'transparent',
        marginRight: SPACING.sm,
    },
    activeTab: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.secondary,
    },
    pressedTab: {
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
    },
    emoji: {
        fontSize: 20,
        marginRight: SPACING.xs,
    },
    tabText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.textLight,
    },
    activeTabText: {
        color: COLORS.background,
        fontWeight: '700',
    },
});
