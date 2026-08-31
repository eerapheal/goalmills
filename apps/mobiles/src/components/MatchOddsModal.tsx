import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { advancedFootballApi } from '../services/advancedFootballApi';
import { FootballOdds, FootballProbability } from '@goalmills/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MatchOddsModalProps {
  visible: boolean;
  matchId: string | number;
  homeTeam: string;
  awayTeam: string;
  onClose: () => void;
}

export function MatchOddsModal({
  visible,
  matchId,
  homeTeam,
  awayTeam,
  onClose,
}: MatchOddsModalProps) {
  const [loading, setLoading] = useState(false);
  const [odds, setOdds] = useState<FootballOdds[]>([]);
  const [probability, setProbability] = useState<FootballProbability | null>(null);

  useEffect(() => {
    if (visible && matchId) {
      loadData();
    }
  }, [visible, matchId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const numMatchId = Number(matchId);
      const [oddsRes, probRes] = await Promise.allSettled([
        advancedFootballApi.getOdds({ matchId: numMatchId }),
        advancedFootballApi.getProbabilities({ matchId: numMatchId }),
      ]);

      if (oddsRes.status === 'fulfilled' && oddsRes.value?.result) {
        const matchOdds = oddsRes.value.result[String(matchId)] || [];
        setOdds(Array.isArray(matchOdds) ? matchOdds : []);
      }

      if (probRes.status === 'fulfilled' && probRes.value?.result) {
        const prob =
          probRes.value.result.find((p) => String(p.event_key) === String(matchId)) ||
          probRes.value.result[0] ||
          null;
        setProbability(prob);
      }
    } catch (err) {
      console.error('[MatchOddsModal] Error loading odds:', err);
    } finally {
      setLoading(false);
    }
  };

  const hwPct = Number(probability?.event_HW) || 0;
  const dPct = Number(probability?.event_D) || 0;
  const awPct = Number(probability?.event_AW) || 0;

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Odds & AI Prediction</Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {homeTeam} vs {awayTeam}
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#94A3B8" />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#F59E0B" size="large" />
            <Text style={styles.loadingText}>Loading odds data...</Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Win Probability */}
            {probability && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🤖 AI Win Probability</Text>
                <View style={styles.probLabels}>
                  <Text style={styles.probHome}>
                    {homeTeam.split(' ').pop()}{'\n'}{hwPct}%
                  </Text>
                  <Text style={styles.probDraw}>Draw{'\n'}{dPct}%</Text>
                  <Text style={styles.probAway}>
                    {awayTeam.split(' ').pop()}{'\n'}{awPct}%
                  </Text>
                </View>
                <View style={styles.probBar}>
                  <View style={[styles.probBarHome, { flex: hwPct || 1 }]} />
                  <View style={[styles.probBarDraw, { flex: dPct || 1 }]} />
                  <View style={[styles.probBarAway, { flex: awPct || 1 }]} />
                </View>

                {/* Extra markets */}
                <View style={styles.extraGrid}>
                  <View style={styles.extraCell}>
                    <Text style={styles.extraLabel}>Over 2.5</Text>
                    <Text style={styles.extraValueGreen}>{probability.event_O}%</Text>
                  </View>
                  <View style={styles.extraCell}>
                    <Text style={styles.extraLabel}>Under 2.5</Text>
                    <Text style={styles.extraValueRed}>{probability.event_U}%</Text>
                  </View>
                  <View style={styles.extraCell}>
                    <Text style={styles.extraLabel}>Both Score</Text>
                    <Text style={styles.extraValueAmber}>{probability.event_bts}%</Text>
                  </View>
                  <View style={styles.extraCell}>
                    <Text style={styles.extraLabel}>Clean Sheet</Text>
                    <Text style={styles.extraValueCyan}>{probability.event_ots}%</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Bookmaker Odds Table */}
            {odds.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Bookmaker Odds (1X2)</Text>
                <View style={styles.oddsHeader}>
                  <Text style={[styles.oddsCell, styles.oddsBookie]}>Bookmaker</Text>
                  <Text style={[styles.oddsCell, styles.oddsNum, { color: '#60A5FA' }]}>1</Text>
                  <Text style={[styles.oddsCell, styles.oddsNum]}>X</Text>
                  <Text style={[styles.oddsCell, styles.oddsNum, { color: '#FBBF24' }]}>2</Text>
                  <Text style={[styles.oddsCell, styles.oddsNum, { color: '#34D399' }]}>O2.5</Text>
                  <Text style={[styles.oddsCell, styles.oddsNum, { color: '#F87171' }]}>U2.5</Text>
                </View>
                {odds.slice(0, 8).map((o, i) => (
                  <View key={i} style={[styles.oddsRow, i % 2 === 0 ? styles.oddsRowEven : {}]}>
                    <Text style={[styles.oddsCell, styles.oddsBookie]} numberOfLines={1}>
                      {o.odd_bookmakers}
                    </Text>
                    <Text style={[styles.oddsCell, styles.oddsNum, { color: '#60A5FA', fontWeight: '900' }]}>
                      {o.odd_1 || '-'}
                    </Text>
                    <Text style={[styles.oddsCell, styles.oddsNum, { color: '#CBD5E1' }]}>
                      {o.odd_x || '-'}
                    </Text>
                    <Text style={[styles.oddsCell, styles.oddsNum, { color: '#FBBF24', fontWeight: '900' }]}>
                      {o.odd_2 || '-'}
                    </Text>
                    <Text style={[styles.oddsCell, styles.oddsNum, { color: '#34D399' }]}>
                      {o['o+2.5'] || '-'}
                    </Text>
                    <Text style={[styles.oddsCell, styles.oddsNum, { color: '#F87171' }]}>
                      {o['u+2.5'] || '-'}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {!probability && odds.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No odds or predictions available for this match.</Text>
              </View>
            )}

            <View style={{ height: 32 }} />
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    maxHeight: SCREEN_HEIGHT * 0.82,
    backgroundColor: '#0B1526',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F8FAFC',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F8FAFC',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  probLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  probHome: {
    fontSize: 11,
    fontWeight: '800',
    color: '#60A5FA',
    textAlign: 'left',
  },
  probDraw: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textAlign: 'center',
  },
  probAway: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FBBF24',
    textAlign: 'right',
  },
  probBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    marginBottom: 12,
  },
  probBarHome: {
    backgroundColor: '#2563EB',
  },
  probBarDraw: {
    backgroundColor: '#475569',
  },
  probBarAway: {
    backgroundColor: '#D97706',
  },
  extraGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  extraCell: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 10,
    alignItems: 'center',
  },
  extraLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  extraValueGreen: {
    fontSize: 18,
    fontWeight: '900',
    color: '#34D399',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  extraValueRed: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F87171',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  extraValueAmber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FBBF24',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  extraValueCyan: {
    fontSize: 18,
    fontWeight: '900',
    color: '#67E8F9',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  oddsHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 4,
  },
  oddsRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  oddsRowEven: {
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  oddsCell: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  oddsBookie: {
    flex: 2,
    fontWeight: '700',
    color: '#E2E8F0',
    fontSize: 11,
    paddingRight: 4,
  },
  oddsNum: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
  },
});
