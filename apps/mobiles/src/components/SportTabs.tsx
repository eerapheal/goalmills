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
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    gap: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 4,
  },
  activeTab: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderColor: '#3B82F6',
  },
  pressedTab: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  emoji: {
    fontSize: 13,
    marginRight: 4,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeTabText: {
    color: '#60A5FA',
    fontWeight: '800',
  },
  soonBadge: {
    marginLeft: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  soonBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#93C5FD',
    textTransform: 'uppercase',
  },
});
