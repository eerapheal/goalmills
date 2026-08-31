import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PITCH_WIDTH = SCREEN_WIDTH - 32;
const PITCH_HEIGHT = PITCH_WIDTH * 1.35;

interface PlayerBadgeData {
  player: string;
  player_number?: string | number;
  player_pos?: string;
}

interface TacticalPitchProps {
  homeTeamName: string;
  awayTeamName: string;
  homeFormation?: string;
  awayFormation?: string;
  homePlayers: PlayerBadgeData[];
  awayPlayers: PlayerBadgeData[];
}

function PlayerDot({
  player,
  color,
}: {
  player: PlayerBadgeData;
  color: 'blue' | 'amber';
}) {
  const lastName = player.player?.split(' ').pop() || player.player || '';
  return (
    <View style={styles.playerDotWrapper}>
      <View style={[styles.playerDot, color === 'blue' ? styles.dotBlue : styles.dotAmber]}>
        <Text style={styles.playerNumber}>{player.player_number || '?'}</Text>
      </View>
      <Text style={styles.playerName} numberOfLines={1}>
        {lastName}
      </Text>
    </View>
  );
}

export function TacticalPitch({
  homeTeamName,
  awayTeamName,
  homeFormation,
  awayFormation,
  homePlayers,
  awayPlayers,
}: TacticalPitchProps) {
  return (
    <View style={styles.pitchContainer}>
      {/* Pitch Background */}
      <View style={styles.pitch}>
        {/* Centre Line */}
        <View style={styles.centreLine} />
        {/* Centre Circle */}
        <View style={styles.centreCircle} />

        {/* Home Team (bottom half) */}
        <View style={styles.homeHalf}>
          <Text style={styles.teamLabel}>
            {homeTeamName} {homeFormation ? `(${homeFormation})` : ''}
          </Text>
          <View style={styles.playerRow}>
            {homePlayers.map((p, i) => (
              <PlayerDot key={`home-${i}`} player={p} color="blue" />
            ))}
          </View>
        </View>

        {/* Away Team (top half) */}
        <View style={styles.awayHalf}>
          <View style={styles.playerRow}>
            {awayPlayers.map((p, i) => (
              <PlayerDot key={`away-${i}`} player={p} color="amber" />
            ))}
          </View>
          <Text style={styles.teamLabelAway}>
            {awayTeamName} {awayFormation ? `(${awayFormation})` : ''}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pitchContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  pitch: {
    width: '100%',
    minHeight: 340,
    backgroundColor: '#082318',
    position: 'relative',
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  centreLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  centreCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    marginTop: -30,
    marginLeft: -30,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  homeHalf: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 8,
    gap: 8,
  },
  awayHalf: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 8,
    gap: 8,
  },
  teamLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#93C5FD',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  teamLabelAway: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FCD34D',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  playerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 4,
  },
  playerDotWrapper: {
    alignItems: 'center',
    minWidth: 44,
    maxWidth: 54,
  },
  playerDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 3,
  },
  dotBlue: {
    backgroundColor: '#2563EB',
  },
  dotAmber: {
    backgroundColor: '#D97706',
  },
  playerNumber: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  playerName: {
    fontSize: 9,
    fontWeight: '700',
    color: '#F1F5F9',
    textAlign: 'center',
    marginTop: 2,
    maxWidth: 52,
  },
});
