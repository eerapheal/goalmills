import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import goalmillsApi from '../services/goalmillsApi';

interface HeadToHeadViewProps {
  sport?: string;
  teamA?: string;
  teamB?: string;
}

export const HeadToHeadView: React.FC<HeadToHeadViewProps> = ({
  sport = 'football',
  teamA = 'arsenal',
  teamB = 'chelsea',
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadH2H() {
      try {
        const res = await goalmillsApi.getHeadToHead(sport, teamA, teamB);
        if (isMounted && res) {
          setData(res);
        }
      } catch (err) {
        console.warn('Failed to load mobile H2H:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadH2H();
    return () => {
      isMounted = false;
    };
  }, [sport, teamA, teamB]);

  if (loading) {
    return (
      <View style={styles.loaderCard}>
        <ActivityIndicator color="#3B82F6" size="small" />
        <Text style={styles.loadingText}>Loading Head-to-Head intelligence...</Text>
      </View>
    );
  }

  if (!data || data.totalMatches === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>HEAD-TO-HEAD ANALYTICS</Text>
        <Text style={styles.badge}>WAREHOUSE VERIFIED</Text>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.teamCol}>
          <Text style={styles.teamName}>{data.teamA.name}</Text>
          <Text style={styles.winCount}>{data.teamAWins} Wins</Text>
        </View>
        <View style={styles.drawCol}>
          <Text style={styles.drawText}>{data.draws} Draws</Text>
          <Text style={styles.totalText}>{data.totalMatches} Matches</Text>
        </View>
        <View style={[styles.teamCol, { alignItems: 'flex-end' }]}>
          <Text style={styles.teamName}>{data.teamB.name}</Text>
          <Text style={styles.winCount}>{data.teamBWins} Wins</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>AVG GOALS</Text>
          <Text style={styles.statVal}>{data.avgGoalsPerMatch}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>TOP SCORE</Text>
          <Text style={styles.statVal}>{data.mostCommonScoreline}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>CLEAN SHEETS</Text>
          <Text style={styles.statVal}>{data.cleanSheetsTeamA} - {data.cleanSheetsTeamB}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginVertical: 12,
  },
  loaderCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  badge: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: 'rgba(16,185,129,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  teamCol: {
    flex: 1,
  },
  teamName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  winCount: {
    color: '#38BDF8',
    fontWeight: '800',
    fontSize: 11,
    marginTop: 2,
  },
  drawCol: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  drawText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  totalText: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
  },
  statVal: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
});

export default HeadToHeadView;
