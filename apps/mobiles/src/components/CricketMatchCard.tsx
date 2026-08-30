import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { router } from 'expo-router';
import { CricketEvent } from '@goalmills/types';
import { COLORS, SPACING, BORDER_RADIUS } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';

interface CricketMatchCardProps {
  match: CricketEvent;
  onPress?: () => void;
  hideLeague?: boolean;
}

export const CricketMatchCard: React.FC<CricketMatchCardProps> = ({
  match,
  onPress,
  hideLeague = false,
}) => {
  const [homeImgError, setHomeImgError] = useState(false);
  const [awayImgError, setAwayImgError] = useState(false);

  const isLive =
    match.event_live === '1' ||
    match.event_status === 'Live' ||
    match.event_status === 'In Progress' ||
    (match.event_status && match.event_status.toLowerCase().includes('live'));

  const isFinished =
    match.event_status === 'Finished' ||
    match.event_status === 'FT' ||
    (match.event_status && match.event_status.toLowerCase().includes('won')) ||
    (match.event_status && match.event_status.toLowerCase().includes('complete'));

  const isUpcoming = !isLive && !isFinished;

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else if (match?.event_key) {
      router.push(`/home/cricket/matches/${match.event_key}`);
    }
  };

  const homeName = match.event_home_team || 'TBC';
  const awayName = match.event_away_team || 'TBC';

  const getStatusText = () => {
    if (isLive) return 'LIVE';
    if (isFinished) return 'FT';
    return match.event_time || match.event_date_start || 'TBD';
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isLive && styles.liveCard,
        pressed && styles.cardPressed,
      ]}
      onPress={handleCardPress}
    >
      {/* League & Series Header */}
      {!hideLeague && (
        <View style={styles.header}>
          <Pressable
            style={styles.leagueInfo}
            onPress={(e) => {
              e.stopPropagation();
              const seriesId = (match as any).league_key || (match as any).series_id || match.league_name;
              if (seriesId) {
                router.push(`/home/cricket/series/${String(seriesId)}` as any);
              }
            }}
          >
            <Text style={styles.sportEmoji}>🏏</Text>
            {match.event_type && (
              <View style={styles.formatBadge}>
                <Text style={styles.formatText}>{match.event_type}</Text>
              </View>
            )}
            <Text style={styles.leagueName} numberOfLines={1}>
              {match.league_name || 'Tournament'}
            </Text>
          </Pressable>

          {/* Status Badge */}
          <View style={[styles.statusBadge, isLive && styles.liveStatusBadge]}>
            {isLive && <View style={styles.livePulse} />}
            <Text style={[styles.statusText, isLive && styles.liveStatusText]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
      )}

      {/* Main Teams Rows */}
      <View style={styles.matchContent}>
        {/* Home Team */}
        <View style={styles.teamRow}>
          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            onPress={(e) => {
              e.stopPropagation();
              const teamKey = (match as any).home_team_key || (match as any).event_home_team_key || match.event_home_team;
              if (teamKey) {
                router.push(`/home/cricket/teams/${encodeURIComponent(String(teamKey))}` as any);
              }
            }}
          >
            {match.event_home_team_logo && !homeImgError ? (
              <Image
                source={{ uri: match.event_home_team_logo }}
                style={styles.teamLogo}
                resizeMode="contain"
                onError={() => setHomeImgError(true)}
              />
            ) : (
              <View style={styles.fallbackLogo}>
                <Text style={styles.fallbackText}>{homeName.charAt(0)}</Text>
              </View>
            )}
            <Text style={styles.teamName} numberOfLines={1}>
              {homeName}
            </Text>
          </Pressable>
          <View style={styles.scoreContainer}>
            {match.event_home_final_result ? (
              <Text style={[styles.teamScore, isLive && styles.liveScoreText]}>
                {match.event_home_final_result}
              </Text>
            ) : (
              <Text style={styles.yetToBatText}>{isUpcoming ? 'Yet to bat' : '-'}</Text>
            )}
            {match.event_home_rr && <Text style={styles.rrText}>RR: {match.event_home_rr}</Text>}
          </View>
        </View>

        {/* Away Team */}
        <View style={[styles.teamRow, { marginTop: 8 }]}>
          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            onPress={(e) => {
              e.stopPropagation();
              const teamKey = (match as any).away_team_key || (match as any).event_away_team_key || match.event_away_team;
              if (teamKey) {
                router.push(`/home/cricket/teams/${encodeURIComponent(String(teamKey))}` as any);
              }
            }}
          >
            {match.event_away_team_logo && !awayImgError ? (
              <Image
                source={{ uri: match.event_away_team_logo }}
                style={styles.teamLogo}
                resizeMode="contain"
                onError={() => setAwayImgError(true)}
              />
            ) : (
              <View style={styles.fallbackLogo}>
                <Text style={styles.fallbackText}>{awayName.charAt(0)}</Text>
              </View>
            )}
            <Text style={styles.teamName} numberOfLines={1}>
              {awayName}
            </Text>
          </Pressable>
          <View style={styles.scoreContainer}>
            {match.event_away_final_result ? (
              <Text style={[styles.teamScore, isLive && styles.liveScoreText]}>
                {match.event_away_final_result}
              </Text>
            ) : (
              <Text style={styles.yetToBatText}>{isUpcoming ? 'Yet to bat' : '-'}</Text>
            )}
            {match.event_away_rr && <Text style={styles.rrText}>RR: {match.event_away_rr}</Text>}
          </View>
        </View>
      </View>

      {/* Match Status / Outcome note */}
      {match.event_status_info && (
        <View style={styles.statusFooter}>
          <Text style={[styles.statusInfoText, isLive && styles.statusInfoLive]} numberOfLines={1}>
            {match.event_status_info}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#141C2B',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: SPACING.sm,
  },
  liveCard: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: '#1A2333',
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 8,
    marginBottom: 10,
  },
  leagueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    gap: 6,
  },
  sportEmoji: {
    fontSize: 14,
  },
  formatBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  formatText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  leagueName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  liveStatusBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#F59E0B',
    borderWidth: 1,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  liveStatusText: {
    color: '#F59E0B',
    fontWeight: '900',
  },
  matchContent: {
    paddingVertical: 2,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 26,
    height: 26,
    marginRight: 10,
  },
  fallbackLogo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fallbackText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '900',
  },
  teamName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  teamScore: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
    fontVariant: ['tabular-nums'],
  },
  liveScoreText: {
    color: '#F59E0B',
    fontWeight: '900',
  },
  yetToBatText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  rrText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 1,
  },
  statusFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  statusInfoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'center',
  },
  statusInfoLive: {
    color: '#F59E0B',
    fontWeight: '800',
  },
});
