import { ScrollView, Pressable, Text, StyleSheet, View } from 'react-native';
import { SportType } from '@goalmills/types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';

interface SportTabsProps {
  selectedSport: SportType;
  onSelectSport: (sport: SportType) => void;
}

const sports: { type: SportType; name: string; emoji: string; isComingSoon?: boolean }[] = [
  { type: 'football', name: 'Football', emoji: '⚽' },
  { type: 'cricket', name: 'Cricket', emoji: '🏏' },
  { type: 'basketball', name: 'Basketball', emoji: '🏀' },
  { type: 'tennis', name: 'Tennis', emoji: '🎾', isComingSoon: true },
  { type: 'baseball', name: 'Baseball', emoji: '⚾', isComingSoon: true },
  { type: 'hockey', name: 'Hockey', emoji: '🏒', isComingSoon: true },
];

export function SportTabs({ selectedSport, onSelectSport }: SportTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {sports.map((sport) => {
        const isSelected = selectedSport === sport.type;
        return (
          <Pressable
            key={sport.type}
            style={({ pressed }) => [
              styles.tab,
              isSelected && styles.activeTab,
              pressed && styles.pressedTab,
            ]}
            onPress={() => onSelectSport(sport.type)}
          >
            <Text style={styles.emoji}>{sport.emoji}</Text>
            <Text style={[styles.tabText, isSelected && styles.activeTabText]}>
              {sport.name}
            </Text>
            {sport.isComingSoon && (
              <View style={styles.soonBadge}>
                <Text style={styles.soonBadgeText}>Soon</Text>
              </View>
            )}
          </Pressable>
        );
      })}
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
  soonBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  soonBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FBBF24',
    textTransform: 'uppercase',
  },
});
