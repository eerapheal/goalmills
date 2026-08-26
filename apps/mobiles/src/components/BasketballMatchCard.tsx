import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';
import { ApiBasketballGameItem } from '../services/basketballApi';

interface BasketballMatchCardProps {
  match: any;
  onPress?: () => void;
  hideLeague?: boolean;
}

export const BasketballMatchCard: React.FC<BasketballMatchCardProps> = ({
  match,
  onPress,
  hideLeague = false,
}) => {
  const shortStatus = match?.status?.short || '';
  const isLive = ['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'BT', 'HT', 'LIVE'].includes(shortStatus);
  const isFinished = ['FT', 'AOT'].includes(shortStatus);
  const isUpcoming = !isLive && !isFinished;

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else if (match?.id) {
      router.push(`/home/basketball/matches/${match.id}`);
    }
  };

  const getStatusText = () => {
    if (isLive) {
      if (match?.status?.timer) return `${shortStatus} ${match.status.timer}`;
      return shortStatus || 'LIVE';
    }
    if (isFinished) {
      return shortStatus === 'AOT' ? 'FT (OT)' : 'FT';
    }
    return match?.time || 'TBD';
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
      {/* League Header */}
      {!hideLeague && (
        <View style={styles.header}>
          <View style={styles.leagueInfo}>
            {match?.league?.logo ? (
              <Image
                source={{ uri: match.league.logo }}
                style={styles.leagueLogo}
                resizeMode="contain"
              />
            ) : (
              <Ionicons name="basketball-outline" size={14} color="#F97316" />
            )}
            <Text style={styles.leagueName} numberOfLines={1}>
              {match?.league?.name || 'Competition'}
            </Text>
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBadge, isLive && styles.liveStatusBadge]}>
            {isLive && <View style={styles.livePulse} />}
            <Text style={[styles.statusText, isLive && styles.liveStatusText]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
      )}

      {/* Main Teams Row */}
      <View style={styles.matchContent}>
        {/* Home Team */}
        <View style={styles.teamRow}>
          {match?.teams?.home?.logo ? (
            <Image
              source={{ uri: match.teams.home.logo }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.fallbackLogo}>
              <Ionicons name="shield-outline" size={14} color="#94A3B8" />
            </View>
          )}
          <Text style={styles.teamName} numberOfLines={1}>
            {match?.teams?.home?.name || 'Home Team'}
          </Text>
          <Text
            style={[
              styles.teamScore,
              isLive && styles.liveScoreText,
              isFinished &&
                (match?.scores?.home?.total || 0) > (match?.scores?.away?.total || 0) &&
                styles.winningScore,
            ]}
          >
            {isUpcoming ? '-' : match?.scores?.home?.total ?? 0}
          </Text>
        </View>

        {/* Away Team */}
        <View style={[styles.teamRow, { marginTop: 6 }]}>
          {match?.teams?.away?.logo ? (
            <Image
              source={{ uri: match.teams.away.logo }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.fallbackLogo}>
              <Ionicons name="shield-outline" size={14} color="#94A3B8" />
            </View>
          )}
          <Text style={styles.teamName} numberOfLines={1}>
            {match?.teams?.away?.name || 'Away Team'}
          </Text>
          <Text
            style={[
              styles.teamScore,
              isLive && styles.liveScoreText,
              isFinished &&
                (match?.scores?.away?.total || 0) > (match?.scores?.home?.total || 0) &&
                styles.winningScore,
            ]}
          >
            {isUpcoming ? '-' : match?.scores?.away?.total ?? 0}
          </Text>
        </View>
      </View>

      {/* Quarters breakdown (if live or finished) */}
      {!isUpcoming && match?.scores && (
        <View style={styles.quartersFooter}>
          <View style={styles.quarterColumn}>
            <Text style={styles.quarterLabel}>Q1</Text>
            <Text style={styles.quarterScore}>
              {match.scores.home?.quarter_1 ?? '-'}:{match.scores.away?.quarter_1 ?? '-'}
            </Text>
          </View>
          <View style={styles.quarterColumn}>
            <Text style={styles.quarterLabel}>Q2</Text>
            <Text style={styles.quarterScore}>
              {match.scores.home?.quarter_2 ?? '-'}:{match.scores.away?.quarter_2 ?? '-'}
            </Text>
          </View>
          <View style={styles.quarterColumn}>
            <Text style={styles.quarterLabel}>Q3</Text>
            <Text style={styles.quarterScore}>
              {match.scores.home?.quarter_3 ?? '-'}:{match.scores.away?.quarter_3 ?? '-'}
            </Text>
          </View>
          <View style={styles.quarterColumn}>
            <Text style={styles.quarterLabel}>Q4</Text>
            <Text style={styles.quarterScore}>
              {match.scores.home?.quarter_4 ?? '-'}:{match.scores.away?.quarter_4 ?? '-'}
            </Text>
          </View>
          {match.scores.home?.over_time !== null && match.scores.home?.over_time !== undefined && (
            <View style={styles.quarterColumn}>
              <Text style={styles.quarterLabel}>OT</Text>
              <Text style={styles.quarterScore}>
                {match.scores.home.over_time}:{match.scores.away?.over_time ?? '-'}
              </Text>
            </View>
          )}
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
    borderColor: 'rgba(249, 115, 22, 0.4)',
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
  },
  leagueLogo: {
    width: 16,
    height: 16,
    marginRight: 6,
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
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    borderColor: '#F97316',
    borderWidth: 1,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F97316',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  liveStatusText: {
    color: '#F97316',
  },
  matchContent: {
    paddingVertical: 2,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  fallbackLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  teamName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  teamScore: {
    fontSize: 16,
    fontWeight: '800',
    color: '#94A3B8',
    minWidth: 32,
    textAlign: 'right',
  },
  winningScore: {
    color: '#F8FAFC',
    fontWeight: '900',
  },
  liveScoreText: {
    color: '#F97316',
    fontWeight: '900',
  },
  quartersFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  quarterColumn: {
    alignItems: 'center',
  },
  quarterLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  quarterScore: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 1,
  },
});
