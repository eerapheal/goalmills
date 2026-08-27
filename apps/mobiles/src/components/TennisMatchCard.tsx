import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { TennisEvent } from '@goalmills/types';

interface TennisMatchCardProps {
  match: TennisEvent;
  odds?: any;
}

export function TennisMatchCard({ match, odds }: TennisMatchCardProps) {
  const router = useRouter();

  const renderScore = (playerIndex: 0 | 1) => {
    if (!match.scores) return null;

    // Show set scores and current game score if live
    return (
      <View style={styles.scoresContainer}>
        {match.scores.map((set, index) => (
          <Text
            key={index}
            style={[
              styles.setScore,
              // Highlight current set if match is live (mock logic)
            ]}
          >
            {playerIndex === 0 ? set.score_first : set.score_second}
          </Text>
        ))}
        {match.event_live === '1' && (
          <Text style={styles.gameScore}>
            {playerIndex === 0
              ? match.event_game_result?.split(' - ')[0]
              : match.event_game_result?.split(' - ')[1]}
          </Text>
        )}
      </View>
    );
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => router.push(`/home/tennis/matches/${match.event_key}`)}
    >
      {/* Header: League & Status */}
      <View style={styles.header}>
        <View style={styles.leagueInfo}>
          <Text style={styles.leagueName}>
            {match.league_name} {match.league_round && `• ${match.league_round}`}
          </Text>
        </View>
        <View style={[styles.statusBadge, match.event_live === '1' && styles.liveBadge]}>
          <Text style={[styles.statusText, match.event_live === '1' && styles.liveStatusText]}>
            {match.event_live === '1' ? 'LIVE' : match.event_status}
          </Text>
        </View>
      </View>

      {/* Teams Row */}
      <View style={styles.matchContent}>
        {/* Player 1 */}
        <View style={styles.teamRow}>
          <Pressable
            style={styles.teamInfo}
            onPress={(e) => {
              e.stopPropagation();
              router.push(`/home/tennis/players/${match.first_player_key}`);
            }}
          >
            <Image
              source={{ uri: match.event_first_player_logo || 'https://via.placeholder.com/40' }}
              style={styles.logo}
            />
            <Text style={styles.teamName}>{match.event_first_player}</Text>
            {match.event_serve === 'First Player' && match.event_live === '1' && (
              <View style={styles.serverIndicator} />
            )}
          </Pressable>
          {renderScore(0)}
        </View>

        {/* Player 2 */}
        <View style={styles.teamRow}>
          <Pressable
            style={styles.teamInfo}
            onPress={(e) => {
              e.stopPropagation();
              router.push(`/home/tennis/players/${match.second_player_key}`);
            }}
          >
            <Image
              source={{ uri: match.event_second_player_logo || 'https://via.placeholder.com/40' }}
              style={styles.logo}
            />
            <Text style={styles.teamName}>{match.event_second_player}</Text>
            {match.event_serve === 'Second Player' && match.event_live === '1' && (
              <View style={styles.serverIndicator} />
            )}
          </Pressable>
          {renderScore(1)}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.matchDetails}>
          {match.league_surface} • {match.country_name}
        </Text>

        {/* Odds Display */}
        {odds && odds['Match Winner'] && (
          <View style={styles.oddsContainer}>
            <View style={styles.oddItem}>
              <Text style={styles.oddLabel}>1</Text>
              <Text style={styles.oddValue}>{odds['Match Winner']['Home']?.['Bet365'] || '-'}</Text>
            </View>
            <View style={styles.oddItem}>
              <Text style={styles.oddLabel}>2</Text>
              <Text style={styles.oddValue}>{odds['Match Winner']['Away']?.['Bet365'] || '-'}</Text>
            </View>
          </View>
        )}

        <Text style={styles.matchTime}>{match.event_time}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pressed: {
    opacity: 0.8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  leagueInfo: {
    flex: 1,
  },
  leagueName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  liveBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  liveStatusText: {
    color: '#ef4444',
  },
  matchContent: {
    gap: SPACING.sm,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  logo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  teamName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.background,
    fontWeight: '600',
    flex: 1,
  },
  scoresContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  setScore: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    width: 20,
    textAlign: 'center',
  },
  gameScore: {
    color: COLORS.secondary,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    marginLeft: SPACING.sm,
    minWidth: 30,
    textAlign: 'right',
  },
  serverIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
    marginLeft: -SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  matchDetails: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  matchTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  oddsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginVertical: SPACING.xs,
    justifyContent: 'center',
  },
  oddItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  oddLabel: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  oddValue: {
    color: COLORS.secondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
});
