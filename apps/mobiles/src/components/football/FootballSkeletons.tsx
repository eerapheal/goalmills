import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '@goalmills/ui';

export function ShimmerBox({
  width,
  height,
  borderRadius = BORDER_RADIUS.sm,
  style,
}: {
  width?: number | string;
  height: number | string;
  borderRadius?: number;
  style?: any;
}) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.shimmerBase,
        {
          width: width as any,
          height: height as any,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function LeagueRibbonSkeleton() {
  return (
    <View style={styles.ribbonContainer}>
      {[...Array(6)].map((_, i) => (
        <ShimmerBox
          key={i}
          width={100}
          height={34}
          borderRadius={BORDER_RADIUS.full}
          style={styles.ribbonPill}
        />
      ))}
    </View>
  );
}

export function MatchCardSkeleton() {
  return (
    <View style={styles.matchCard}>
      <View style={styles.matchCardHeader}>
        <ShimmerBox width={90} height={14} />
        <ShimmerBox width={45} height={14} borderRadius={BORDER_RADIUS.xs} />
      </View>
      <View style={styles.matchCardTeams}>
        <View style={styles.teamRow}>
          <View style={styles.teamInfo}>
            <ShimmerBox width={22} height={22} borderRadius={BORDER_RADIUS.full} />
            <ShimmerBox width={120} height={16} />
          </View>
          <ShimmerBox width={24} height={18} />
        </View>
        <View style={styles.teamRow}>
          <View style={styles.teamInfo}>
            <ShimmerBox width={22} height={22} borderRadius={BORDER_RADIUS.full} />
            <ShimmerBox width={110} height={16} />
          </View>
          <ShimmerBox width={24} height={18} />
        </View>
      </View>
    </View>
  );
}

export function StandingsTableSkeleton() {
  return (
    <View style={styles.standingsCard}>
      <View style={styles.standingsHeader}>
        <ShimmerBox width={140} height={18} />
        <ShimmerBox width={60} height={14} />
      </View>
      <View style={styles.standingsRows}>
        {[...Array(8)].map((_, i) => (
          <View key={i} style={styles.standingsRow}>
            <View style={styles.standingsLeft}>
              <ShimmerBox width={16} height={14} />
              <ShimmerBox width={18} height={18} borderRadius={BORDER_RADIUS.full} />
              <ShimmerBox width={90} height={14} />
            </View>
            <View style={styles.standingsRight}>
              <ShimmerBox width={18} height={14} />
              <ShimmerBox width={18} height={14} />
              <ShimmerBox width={18} height={14} />
              <ShimmerBox width={26} height={16} borderRadius={BORDER_RADIUS.xs} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function PlayerCardSkeleton() {
  return (
    <View style={styles.playerCard}>
      <ShimmerBox width={64} height={64} borderRadius={BORDER_RADIUS.full} />
      <ShimmerBox width={110} height={16} style={{ marginTop: SPACING.xs }} />
      <ShimmerBox width={80} height={12} style={{ marginTop: 4 }} />
      <View style={styles.playerCardStats}>
        <ShimmerBox width="45%" height={26} borderRadius={BORDER_RADIUS.xs} />
        <ShimmerBox width="45%" height={26} borderRadius={BORDER_RADIUS.xs} />
      </View>
    </View>
  );
}

export function HeroSpotlightSkeleton() {
  return (
    <View style={styles.heroSpotlight}>
      <View style={styles.heroHeader}>
        <ShimmerBox width={130} height={16} />
        <ShimmerBox width={60} height={20} borderRadius={BORDER_RADIUS.full} />
      </View>
      <View style={styles.heroBody}>
        <ShimmerBox width={72} height={72} borderRadius={BORDER_RADIUS.full} />
        <View style={styles.heroDetails}>
          <ShimmerBox width={140} height={18} />
          <ShimmerBox width={100} height={14} style={{ marginTop: 6 }} />
          <ShimmerBox width={80} height={12} style={{ marginTop: 6 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shimmerBase: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  ribbonContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  ribbonPill: {
    marginRight: SPACING.xs,
  },
  matchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  matchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  matchCardTeams: {
    gap: SPACING.xs,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  standingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  standingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  standingsRows: {
    gap: SPACING.sm,
  },
  standingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  standingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  standingsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  playerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: SPACING.md,
    alignItems: 'center',
    width: 150,
    marginRight: SPACING.sm,
  },
  playerCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: SPACING.sm,
  },
  heroSpotlight: {
    backgroundColor: 'rgba(10, 22, 43, 0.8)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  heroDetails: {
    flex: 1,
  },
});
