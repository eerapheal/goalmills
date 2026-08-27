import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';

export interface UnifiedMatchEvent {
  event_key: string | number;
  event_date?: string;
  event_time?: string;
  event_status?: string;
  event_live?: string;
  event_home_team: string;
  home_team_key?: string | number;
  home_team_logo?: string;
  event_away_team: string;
  away_team_key?: string | number;
  away_team_logo?: string;
  event_final_result?: string;
  event_ft_result?: string;
  league_name?: string;
  league_key?: string | number;
  league_logo?: string;
  country_name?: string;
  country_logo?: string;
  goalscorers?: any[];
}

interface FootballMatchCardProps {
  event: UnifiedMatchEvent;
}

export function FootballMatchCard({ event }: FootballMatchCardProps) {
  const router = useRouter();

  const isLive =
    event.event_live === '1' ||
    event.event_status === '1H' ||
    event.event_status === '2H' ||
    event.event_status === 'HT' ||
    event.event_status === 'ET' ||
    event.event_status === 'P' ||
    event.event_status === 'LIVE';

  const isFinished =
    event.event_status?.toLowerCase() === 'finished' ||
    event.event_status === 'FT' ||
    event.event_status === 'AET' ||
    event.event_status === 'AP' ||
    event.event_status === 'PEN';

  const isUpcoming = !isLive && !isFinished;

  // Format kickoff time
  const formattedKickoff = useMemo(() => {
    if (!event.event_time && !event.event_date) return 'TBD';
    if (event.event_time) {
      return event.event_time.slice(0, 5);
    }
    return event.event_date;
  }, [event.event_time, event.event_date]);

  // Format Status Badge text
  const statusDisplay = useMemo(() => {
    if (isLive) {
      if (event.event_status === 'HT') return 'HT';
      if (!isNaN(Number(event.event_status))) return `${event.event_status}'`;
      return 'LIVE';
    }
    if (isFinished) {
      return event.event_status === 'Finished' ? 'FT' : event.event_status || 'FT';
    }
    return formattedKickoff;
  }, [isLive, isFinished, event.event_status, formattedKickoff]);

  // Score display
  const scoreDisplay = useMemo(() => {
    if (isFinished || isLive) {
      if (event.event_final_result && event.event_final_result !== '-') {
        return event.event_final_result;
      }
      if (event.event_ft_result && event.event_ft_result !== '-') {
        return event.event_ft_result;
      }
      return '0 - 0';
    }
    return 'vs';
  }, [isFinished, isLive, event.event_final_result, event.event_ft_result]);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed, isLive && styles.liveCard]}
      onPress={() => {
        if (event.event_key) {
          router.push(`/home/football/matches/${String(event.event_key)}` as any);
        }
      }}
    >
      {/* League Header */}
      <View style={styles.leagueHeader}>
        <View style={styles.leagueLeft}>
          {event.league_logo ? (
            <Image
              source={{ uri: event.league_logo }}
              style={styles.leagueLogo}
              resizeMode="contain"
            />
          ) : (
            <Ionicons
              name="trophy-outline"
              size={14}
              color={COLORS.brandBlue}
              style={{ marginRight: 6 }}
            />
          )}
          <Text style={styles.leagueTitle} numberOfLines={1}>
            {event.league_name || 'Football'}
          </Text>
        </View>

        {isLive ? (
          <View style={styles.livePill}>
            <View style={styles.livePulseDot} />
            <Text style={styles.livePillText}>{statusDisplay}</Text>
          </View>
        ) : (
          <View style={[styles.statusPill, isFinished && styles.finishedPill]}>
            <Text style={styles.statusPillText}>{statusDisplay}</Text>
          </View>
        )}
      </View>

      {/* Teams & Score Row */}
      <View style={styles.teamsScoreRow}>
        {/* Home Team */}
        <Pressable
          style={styles.teamContainer}
          onPress={(e) => {
            e.stopPropagation();
            if (event.home_team_key) {
              router.push(`/home/football/teams/${String(event.home_team_key)}` as any);
            }
          }}
        >
          {event.home_team_logo ? (
            <Image
              source={{ uri: event.home_team_logo }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.teamLogoFallback}>
              <Ionicons name="shield-outline" size={18} color="#94A3B8" />
            </View>
          )}
          <Text style={styles.teamName} numberOfLines={2}>
            {event.event_home_team}
          </Text>
        </Pressable>

        {/* Center Score Section */}
        <View style={styles.scoreBox}>
          {isUpcoming ? (
            <View style={styles.upcomingBadge}>
              <Ionicons name="time-outline" size={14} color="#94A3B8" />
              <Text style={styles.upcomingTime}>{formattedKickoff}</Text>
            </View>
          ) : (
            <View style={styles.scoreNumbersContainer}>
              <Text style={[styles.scoreText, isLive && styles.liveScoreText]}>{scoreDisplay}</Text>
            </View>
          )}
        </View>

        {/* Away Team */}
        <Pressable
          style={styles.teamContainer}
          onPress={(e) => {
            e.stopPropagation();
            if (event.away_team_key) {
              router.push(`/home/football/teams/${String(event.away_team_key)}` as any);
            }
          }}
        >
          {event.away_team_logo ? (
            <Image
              source={{ uri: event.away_team_logo }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.teamLogoFallback}>
              <Ionicons name="shield-outline" size={18} color="#94A3B8" />
            </View>
          )}
          <Text style={styles.teamName} numberOfLines={2}>
            {event.event_away_team}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#141C2B',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  liveCard: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: '#162234',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  leagueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  leagueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  leagueLogo: {
    width: 18,
    height: 18,
    marginRight: 6,
    borderRadius: 4,
  },
  leagueTitle: {
    fontSize: FONT_SIZES.xs,
    color: '#94A3B8',
    fontWeight: '600',
    flex: 1,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    gap: 5,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  livePillText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  finishedPill: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
  },
  statusPillText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  teamsScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  teamLogo: {
    width: 38,
    height: 38,
    marginBottom: 6,
  },
  teamLogoFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  teamName: {
    fontSize: FONT_SIZES.xs,
    color: '#F8FAFC',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  scoreBox: {
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  upcomingTime: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  scoreNumbersContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  scoreText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 2,
  },
  liveScoreText: {
    color: '#10B981',
  },
});
