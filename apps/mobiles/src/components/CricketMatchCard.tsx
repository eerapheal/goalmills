import { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { CricketEvent } from '@goalmills/types';
import { COLORS, BORDER_RADIUS } from '@goalmills/ui';

interface CricketMatchCardProps {
  match: CricketEvent;
  onPress?: () => void;
}

export function CricketMatchCard({ match, onPress }: CricketMatchCardProps) {
  const router = useRouter();
  const [homeImgError, setHomeImgError] = useState(false);
  const [awayImgError, setAwayImgError] = useState(false);

  const isLive =
    match.event_live === '1' ||
    match.event_status === 'Live' ||
    match.event_status === 'In Progress';
  const isUpcoming =
    match.event_status === 'Upcoming' ||
    match.event_status === 'Not Started' ||
    match.event_status === 'Scheduled';

  const handleMatchPress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/home/cricket/matches/${match.event_key}`);
    }
  };

  const homeName = match.event_home_team || 'TBC';
  const awayName = match.event_away_team || 'TBC';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        isLive && styles.liveContainer,
      ]}
      onPress={handleMatchPress}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.leagueInfo}
          onPress={(e) => {
            e.stopPropagation();
            if (match.league_key) router.push(`/home/cricket/series/${match.league_key}`);
          }}
        >
          <View style={styles.formatBadge}>
            <Text style={styles.formatText}>{match.event_type || 'CRICKET'}</Text>
          </View>
          <Text style={styles.leagueName} numberOfLines={1}>
            {match.league_name || 'Tournament'}
          </Text>
        </Pressable>
        {isLive ? (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        ) : match.event_status === 'Finished' ? (
          <View style={styles.ftBadge}>
            <Text style={styles.ftText}>FT</Text>
          </View>
        ) : (
          <Text style={styles.statusText}>{match.event_status || 'SCHEDULED'}</Text>
        )}
      </View>

      {/* Match Info */}
      <View style={styles.matchContainer}>
        {/* Home Team */}
        <Pressable
          style={[styles.teamContainer, styles.teamHome]}
          onPress={(e) => {
            e.stopPropagation();
            if (match.home_team_key) router.push(`/home/cricket/teams/${match.home_team_key}`);
          }}
        >
          {match.event_home_team_logo && !homeImgError ? (
            <Image
              source={{ uri: match.event_home_team_logo }}
              style={styles.teamLogo}
              onError={() => setHomeImgError(true)}
            />
          ) : (
            <View style={[styles.teamLogo, styles.teamLogoPlaceholder]}>
              <Text style={styles.teamLogoText}>{homeName.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.teamInfo}>
            <Text style={styles.teamName} numberOfLines={1}>
              {homeName}
            </Text>
            {!isUpcoming && match.event_home_final_result && (
              <View style={styles.scoreRow}>
                <Text style={styles.scoreText}>{match.event_home_final_result}</Text>
                {match.event_home_rr && (
                  <Text style={styles.rrText}>RR: {match.event_home_rr}</Text>
                )}
              </View>
            )}
          </View>
        </Pressable>

        {/* Status/Time Divider */}
        <View style={styles.statusContainer}>
          <Text style={styles.time}>{match.event_time || '--:--'}</Text>
          <Text style={styles.date}>{match.event_date_start || ''}</Text>
          <View style={styles.vsBadge}>
            <Text style={styles.vsText}>{isLive ? 'LIVE' : 'VS'}</Text>
          </View>
        </View>

        {/* Away Team */}
        <Pressable
          style={[styles.teamContainer, styles.teamAway]}
          onPress={(e) => {
            e.stopPropagation();
            if (match.away_team_key) router.push(`/home/cricket/teams/${match.away_team_key}`);
          }}
        >
          <View style={[styles.teamInfo, { alignItems: 'flex-end' }]}>
            <Text style={[styles.teamName, { textAlign: 'right' }]} numberOfLines={1}>
              {awayName}
            </Text>
            {!isUpcoming && match.event_away_final_result && (
              <View style={[styles.scoreRow, { justifyContent: 'flex-end' }]}>
                {match.event_away_rr && (
                  <Text style={styles.rrText}>RR: {match.event_away_rr}</Text>
                )}
                <Text style={styles.scoreText}>{match.event_away_final_result}</Text>
              </View>
            )}
          </View>
          {match.event_away_team_logo && !awayImgError ? (
            <Image
              source={{ uri: match.event_away_team_logo }}
              style={styles.teamLogo}
              onError={() => setAwayImgError(true)}
            />
          ) : (
            <View style={[styles.teamLogo, styles.teamLogoPlaceholder]}>
              <Text style={styles.teamLogoText}>{awayName.charAt(0)}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Status info / Toss note / Stadium */}
      {match.event_status_info ? (
        <View style={styles.statusInfoWrapper}>
          <Text style={[styles.statusInfoText, isLive && styles.statusInfoLive]} numberOfLines={1}>
            {match.event_status_info}
          </Text>
        </View>
      ) : match.event_stadium ? (
        <Text style={styles.venueText} numberOfLines={1}>
          {match.event_stadium}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.md,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  liveContainer: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderWidth: 1.5,
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  leagueInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 8,
  },
  formatBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  formatText: {
    color: '#60a5fa',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  leagueName: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginRight: 4,
  },
  liveText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: 1,
  },
  ftBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  ftText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  teamContainer: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamHome: {
    justifyContent: 'flex-start',
  },
  teamAway: {
    justifyContent: 'flex-end',
  },
  teamInfo: {
    flex: 1,
  },
  teamLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    resizeMode: 'contain',
  },
  teamLogoPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  teamLogoText: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '900',
  },
  teamName: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  rrText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94A3B8',
  },
  statusContainer: {
    alignItems: 'center',
    width: 68,
    paddingHorizontal: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginHorizontal: 4,
  },
  time: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  date: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginTop: 1,
  },
  vsBadge: {
    marginTop: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  vsText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  statusInfoWrapper: {
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusInfoText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#60a5fa',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statusInfoLive: {
    color: '#F59E0B',
  },
  venueText: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
});
