import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Fixture } from '@goalmills/types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, formatDate, formatTime } from '@goalmills/ui';

interface FixtureCardProps {
  fixture: Fixture;
  onPress?: () => void;
}

export function FixtureCard({ fixture, onPress }: FixtureCardProps) {
  const router = useRouter();
  const { fixture: fixtureData, league, teams, goals, score } = fixture;
  const isLive = ['1H', '2H', 'HT'].includes(fixtureData.status.short);
  const isFinished = fixtureData.status.short === 'FT';
  const isUpcoming = fixtureData.status.short === 'NS';

  // Pulse animation for live dot
  const dotOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isLive) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(dotOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isLive, dotOpacity]);

  const handleMatchPress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/home/matches/${fixtureData.id}`);
    }
  };

  const handleTeamPress = (teamId: number) => {
    router.push(`/home/teams/${teamId}`);
  };

  const handleLeaguePress = (leagueId: number) => {
    router.push(`/home/leagues/${leagueId}`);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        isLive && styles.liveContainer,
      ]}
      onPress={handleMatchPress}
    >
      {/* League Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.leagueInfo}
          onPress={(e) => {
            e.stopPropagation();
            handleLeaguePress(league.id);
          }}
        >
          <Image source={{ uri: league.logo }} style={styles.leagueLogo} />
          <Text style={styles.leagueName} numberOfLines={1}>
            {league.name}
          </Text>
        </Pressable>
        {isLive && (
          <View style={styles.liveBadge}>
            <Animated.View style={[styles.liveDot, { opacity: dotOpacity }]} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        {isFinished && (
          <View style={styles.finishedBadge}>
            <Text style={styles.finishedText}>FT</Text>
          </View>
        )}
      </View>

      {/* Match Info */}
      <View style={styles.matchContainer}>
        {/* Home Team */}
        <Pressable
          style={[styles.teamContainer, styles.teamHome]}
          onPress={(e) => {
            e.stopPropagation();
            handleTeamPress(teams.home.id);
          }}
        >
          <Image source={{ uri: teams.home.logo }} style={styles.teamLogo} />
          <Text style={[styles.teamName, styles.textLeft]} numberOfLines={2}>
            {teams.home.name}
          </Text>
        </Pressable>

        {/* Score/Time */}
        <View style={styles.scoreContainer}>
          {isUpcoming ? (
            <View style={styles.timeContainer}>
              <Text style={styles.time}>{formatTime(fixtureData.date)}</Text>
              <Text style={styles.date}>{formatDate(fixtureData.date)}</Text>
            </View>
          ) : (
            <View style={styles.scoreBox}>
              <View style={styles.scoreRow}>
                <Text style={[styles.score, teams.home.winner && styles.winnerScore]}>
                  {goals.home ?? 0}
                </Text>
                <Text style={styles.scoreSeparator}>-</Text>
                <Text style={[styles.score, teams.away.winner && styles.winnerScore]}>
                  {goals.away ?? 0}
                </Text>
              </View>
              <Text style={[styles.status, isLive && styles.liveStatus]}>
                {isLive ? `${fixtureData.status.elapsed}'` : fixtureData.status.short}
              </Text>
            </View>
          )}
        </View>

        {/* Away Team */}
        <Pressable
          style={[styles.teamContainer, styles.teamAway]}
          onPress={(e) => {
            e.stopPropagation();
            handleTeamPress(teams.away.id);
          }}
        >
          <Text style={[styles.teamName, styles.textRight]} numberOfLines={2}>
            {teams.away.name}
          </Text>
          <Image source={{ uri: teams.away.logo }} style={styles.teamLogo} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#141C2B',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  liveContainer: {
    borderColor: 'rgba(16, 185, 129, 0.45)',
    borderWidth: 1.5,
    backgroundColor: '#121E2E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.07)',
  },
  leagueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leagueLogo: {
    width: 16,
    height: 16,
    marginRight: SPACING.xs,
  },
  leagueName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    gap: 5,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  finishedBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  finishedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  teamContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  teamHome: {
    justifyContent: 'flex-start',
  },
  teamAway: {
    justifyContent: 'flex-end',
  },
  teamLogo: {
    width: 28,
    height: 28,
    flexShrink: 0,
  },
  teamName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#F8FAFC',
    flex: 1,
    lineHeight: 16,
  },
  textLeft: {
    textAlign: 'left',
  },
  textRight: {
    textAlign: 'right',
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    flexShrink: 0,
  },
  timeContainer: {
    alignItems: 'center',
  },
  time: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  date: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  winnerScore: {
    color: '#10B981',
  },
  scoreSeparator: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#64748B',
    marginHorizontal: 4,
  },
  status: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  liveStatus: {
    color: '#10B981',
    fontWeight: '800',
  },
});
