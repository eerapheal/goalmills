import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { advancedFootballApi } from '../../../services/advancedFootballApi';
import { MobileEntityService, COMPETITIONS_REGISTRY } from '../../../utils/entityRegistry';
import { FootballStanding, FootballTopscorer } from '@goalmills/types';

export default function StatsScreen() {
  const router = useRouter();
  const [selectedCompSlug, setSelectedCompSlug] = useState('premier-league');
  const [standings, setStandings] = useState<FootballStanding[]>([]);
  const [topscorers, setTopscorers] = useState<FootballTopscorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const selectedComp = COMPETITIONS_REGISTRY[selectedCompSlug] || COMPETITIONS_REGISTRY['premier-league'];

  const loadData = async (compMeta = selectedComp) => {
    setLoading(true);
    try {
      const [standingsRes, scorersRes] = await Promise.all([
        advancedFootballApi.getStandings(compMeta.id).catch(() => ({ success: 0, result: { total: [] } })),
        advancedFootballApi.getTopscorers(compMeta.id).catch(() => ({ success: 0, result: [] })),
      ]);

      if (standingsRes?.result?.total && Array.isArray(standingsRes.result.total)) {
        setStandings(standingsRes.result.total);
      }
      if (scorersRes?.result && Array.isArray(scorersRes.result)) {
        setTopscorers(scorersRes.result.slice(0, 10));
      }
    } catch (err) {
      console.error('Error loading stats on mobile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCompSlug]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="bar-chart" size={14} color="#f59e0b" />
          <Text style={styles.badgeText}>STATISTICS & RECORDS</Text>
        </View>
        <Text style={styles.title}>GoalMills Stats Center</Text>
        <Text style={styles.subtitle}>
          Live league tables, golden boot race, clean sheets & milestones
        </Text>
      </View>

      {/* Competition Selector Ribbon */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.compScroll}>
        {Object.values(COMPETITIONS_REGISTRY).map((comp) => {
          const isSelected = selectedCompSlug === comp.slug;
          return (
            <TouchableOpacity
              key={comp.slug}
              onPress={() => setSelectedCompSlug(comp.slug)}
              style={[styles.compButton, isSelected && styles.compButtonActive]}
            >
              {comp.logo ? (
                <Image source={{ uri: comp.logo }} style={styles.compLogo} />
              ) : null}
              <Text style={[styles.compText, isSelected && styles.compTextActive]}>
                {comp.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Top Scorers */}
      {topscorers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚽ {selectedComp.name} Top Scorers</Text>
          <View style={styles.tableCard}>
            {topscorers.map((scorer, idx) => (
              <View key={scorer.player_key || idx} style={styles.scorerRow}>
                <Text style={styles.rankText}>#{idx + 1}</Text>
                <View style={styles.scorerInfo}>
                  <Text style={styles.scorerName}>{scorer.player_name}</Text>
                  <Text style={styles.scorerTeam}>{scorer.team_name}</Text>
                </View>
                <View style={styles.goalsBadge}>
                  <Text style={styles.goalsText}>{scorer.goals} Goals</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Standings Table */}
      {standings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 {selectedComp.name} Standings</Text>
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 30 }]}>#</Text>
              <Text style={[styles.th, { flex: 1 }]}>Club</Text>
              <Text style={[styles.th, { width: 35, textAlign: 'center' }]}>P</Text>
              <Text style={[styles.th, { width: 35, textAlign: 'center' }]}>GD</Text>
              <Text style={[styles.th, { width: 40, textAlign: 'right' }]}>Pts</Text>
            </View>

            {standings.map((item) => (
              <View key={item.standing_place} style={styles.tableRow}>
                <Text style={[styles.tdRank, { width: 30 }]}>{item.standing_place}</Text>
                <Text style={[styles.tdClub, { flex: 1 }]} numberOfLines={1}>
                  {item.standing_team}
                </Text>
                <Text style={[styles.td, { width: 35, textAlign: 'center' }]}>
                  {item.standing_P}
                </Text>
                <Text style={[styles.td, { width: 35, textAlign: 'center' }]}>
                  {item.standing_GD}
                </Text>
                <Text style={[styles.tdPts, { width: 40, textAlign: 'right' }]}>
                  {item.standing_PTS}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B12',
  },
  header: {
    padding: 20,
    backgroundColor: '#0c162d',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
  },
  compScroll: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
  },
  compButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 8,
  },
  compButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
  },
  compLogo: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  compText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  compTextActive: {
    color: '#fff',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 10,
  },
  tableCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 8,
    marginBottom: 8,
  },
  th: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  tdRank: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  tdClub: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  td: {
    color: '#94a3b8',
    fontSize: 11,
  },
  tdPts: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '900',
  },
  scorerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  rankText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '900',
    width: 32,
  },
  scorerInfo: {
    flex: 1,
  },
  scorerName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  scorerTeam: {
    color: '#64748b',
    fontSize: 10,
  },
  goalsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  goalsText: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '900',
  },
});
