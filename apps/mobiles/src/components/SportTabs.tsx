import React, { useEffect, useRef } from 'react';
import { ScrollView, Pressable, Text, StyleSheet, View, Animated } from 'react-native';
import { SportType } from '@goalmills/types';
import { SPACING, BORDER_RADIUS } from '@goalmills/ui';

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

function SportTab({
  sport,
  isSelected,
  onPress,
}: {
  sport: (typeof sports)[number];
  isSelected: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!sport.isComingSoon) {
      Animated.spring(scaleAnim, { toValue: 0.94, useNativeDriver: true, speed: 50 }).start();
    }
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={[
          styles.tab,
          isSelected && styles.activeTab,
          sport.isComingSoon && styles.soonTab,
        ]}
        onPress={sport.isComingSoon ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        pointerEvents={sport.isComingSoon ? 'none' : 'auto'}
      >
        <Text style={[styles.emoji, sport.isComingSoon && styles.soonEmoji]}>
          {sport.emoji}
        </Text>
        <Text style={[styles.tabText, isSelected && styles.activeTabText, sport.isComingSoon && styles.soonTabText]}>
          {sport.name}
        </Text>
        {sport.isComingSoon && (
          <View style={styles.soonBadge}>
            <Text style={styles.soonBadgeText}>Soon</Text>
          </View>
        )}
        {isSelected && <View style={styles.activeIndicator} />}
      </Pressable>
    </Animated.View>
  );
}

export function SportTabs({ selectedSport, onSelectSport }: SportTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {sports.map((sport) => (
        <SportTab
          key={sport.type}
          sport={sport}
          isSelected={selectedSport === sport.type}
          onPress={() => onSelectSport(sport.type)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
    backgroundColor: '#070D18',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  container: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    minHeight: 36,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3B82F6',
    borderWidth: 1.5,
  },
  soonTab: {
    opacity: 0.45,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: '25%',
    right: '25%',
    height: 2,
    borderRadius: 1,
    backgroundColor: '#3B82F6',
  },
  emoji: {
    fontSize: 14,
    marginRight: 5,
  },
  soonEmoji: {
    opacity: 0.7,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#60A5FA',
    fontWeight: '800',
  },
  soonTabText: {
    color: '#475569',
  },
  soonBadge: {
    marginLeft: 5,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  soonBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#93C5FD',
    textTransform: 'uppercase',
  },
});
