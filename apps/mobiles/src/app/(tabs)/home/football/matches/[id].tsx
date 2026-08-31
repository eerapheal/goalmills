import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  FlatList,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';
import { advancedFootballApi } from '../../../../../services/advancedFootballApi';
import { TacticalPitch } from '../../../../../components/TacticalPitch';
import {
  FootballEvent,
  FootballH2HResponse,
  FootballOdds,
  FootballLiveOdd,
  FootballFullMatchOdds,
  FootballProbability,
  FootballVideo,
  FootballStanding,
} from '@goalmills/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type DetailTab =
  | 'overview'
  | 'events'
  | 'lineups'
  | 'stats'
  | 'h2h'
  | 'odds'
  | 'probabilities'
  | 'highlights'
  | 'standings';

const TABS: { id: DetailTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'overview', label: 'Overview', icon: 'information-circle-outline' },
  { id: 'events', label: 'Timeline', icon: 'flash-outline' },
  { id: 'lineups', label: 'Lineups', icon: 'layers-outline' },
  { id: 'stats', label: 'Statistics', icon: 'bar-chart-outline' },
  { id: 'h2h', label: 'H2H', icon: 'git-compare-outline' },
  { id: 'odds', label: 'Odds Hub', icon: 'trending-up-outline' },
  { id: 'probabilities', label: 'AI Prediction', icon: 'analytics-outline' },
  { id: 'highlights', label: 'Videos', icon: 'videocam-outline' },
  { id: 'standings', label: 'Table', icon: 'trophy-outline' },
];

export default function MatchCenterScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const matchId = String(id || '');

  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [fixture, setFixture] = useState<FootballEvent | null>(null);
  const [h2h, setH2h] = useState<FootballH2HResponse['result'] | null>(null);
  const [odds, setOdds] = useState<FootballOdds[]>([]);
  const [liveOdds, setLiveOdds] = useState<FootballLiveOdd[]>([]);
  const [fullOdds, setFullOdds] = useState<FootballFullMatchOdds | null>(null);
  const [probability, setProbability] = useState<FootballProbability | null>(null);
  const [videos, setVideos] = useState<FootballVideo[]>([]);
  const [standings, setStandings] = useState<FootballStanding[]>([]);

  const loadData = useCallback(async () => {
    if (!matchId) return;
    try {
      const numMatchId = Number(matchId);
      // Primary: Fixture with player stats
      const fixRes = await advancedFootballApi.getFixtures({
        matchId: numMatchId,
        withPlayerStats: '1',
      });
      const fix = fixRes?.result?.[0] || null;
      setFixture(fix);

      if (fix) {
        const homeKey = Number(fix.home_team_key);
        const awayKey = Number(fix.away_team_key);
        const leagueKey = Number(fix.league_key);

        const [h2hRes, oddsRes, liveOddsRes, fullOddsRes, probRes, videoRes, standRes] =
          await Promise.allSettled([
            homeKey && awayKey
              ? advancedFootballApi.getH2H(homeKey, awayKey)
              : Promise.resolve(null),
            advancedFootballApi.getOdds({ matchId: numMatchId }),
            advancedFootballApi.getLiveOdds({ matchId: numMatchId }),
            advancedFootballApi.getFullOdds({ matchId: numMatchId }),
            advancedFootballApi.getProbabilities({ matchId: numMatchId }),
            advancedFootballApi.getVideos(numMatchId),
            leagueKey ? advancedFootballApi.getStandings(leagueKey) : Promise.resolve(null),
          ]);

        if (h2hRes.status === 'fulfilled' && h2hRes.value?.result) {
          setH2h(h2hRes.value.result);
        }
        if (oddsRes.status === 'fulfilled' && oddsRes.value?.result) {
          setOdds(oddsRes.value.result[matchId] || []);
        }
        if (liveOddsRes.status === 'fulfilled' && liveOddsRes.value?.result) {
          setLiveOdds(liveOddsRes.value.result[matchId] || []);
        }
        if (fullOddsRes.status === 'fulfilled' && fullOddsRes.value?.result) {
          setFullOdds(fullOddsRes.value.result[matchId] || null);
        }
        if (probRes.status === 'fulfilled' && probRes.value?.result) {
          const prob =
            probRes.value.result.find((p) => String(p.event_key) === matchId) ||
            probRes.value.result[0] ||
            null;
          setProbability(prob);
        }
        if (videoRes.status === 'fulfilled' && videoRes.value?.result) {
          setVideos(videoRes.value.result || []);
        }
        if (standRes.status === 'fulfilled' && standRes.value?.result) {
          const res = standRes.value.result as any;
          const table = Array.isArray(res) ? res : res.total || [];
          setStandings(table);
        }
      }
    } catch (err) {
      console.error('[MatchCenter] Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [matchId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const isLive =
    fixture?.event_live === '1' ||
    ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(fixture?.event_status || '') ||
    !isNaN(Number(fixture?.event_status));

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Loading Match Center...</Text>
      </View>
    );
  }

  if (!fixture) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>⚽</Text>
        <Text style={styles.errorTitle}>Match Not Found</Text>
        <Text style={styles.errorSub}>This fixture could not be loaded from the provider.</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back to Dashboard</Text>
        </Pressable>
      </View>
    );
  }

  const score =
    fixture.event_final_result || fixture.event_ft_result || fixture.event_halftime_result || '-';
  const homePlayers = fixture.lineups?.home_team?.starting_lineups || [];
  const awayPlayers = fixture.lineups?.away_team?.starting_lineups || [];

  // ─── TAB CONTENT ───────────────────────────────────────────────

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Match Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Match Information</Text>
        {[
          { label: 'Competition', value: fixture.league_name },
          { label: 'Date', value: fixture.event_date },
          { label: 'Kickoff', value: fixture.event_time || 'TBA' },
          { label: 'Venue', value: fixture.event_stadium || 'Official Venue' },
          { label: 'Referee', value: fixture.event_referee || 'Official Referee' },
          { label: 'Home Formation', value: fixture.event_home_formation || '4-3-3' },
          { label: 'Away Formation', value: fixture.event_away_formation || '4-2-3-1' },
        ].map((row, i) => (
          <View key={i} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{row.label}</Text>
            <Text style={styles.infoValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      {/* Quick Probability preview */}
      {probability && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Win Probabilities</Text>
          <View style={styles.probLabels}>
            <Text style={[styles.probTeam, { color: '#60A5FA' }]}>
              {fixture.event_home_team}{'\n'}{probability.event_HW}%
            </Text>
            <Text style={[styles.probTeam, { color: '#94A3B8', textAlign: 'center' }]}>
              Draw{'\n'}{probability.event_D}%
            </Text>
            <Text style={[styles.probTeam, { color: '#FBBF24', textAlign: 'right' }]}>
              {fixture.event_away_team}{'\n'}{probability.event_AW}%
            </Text>
          </View>
          <View style={styles.probBar}>
            <View
              style={[styles.probBarSegment, { flex: Number(probability.event_HW) || 1, backgroundColor: '#2563EB' }]}
            />
            <View
              style={[styles.probBarSegment, { flex: Number(probability.event_D) || 1, backgroundColor: '#475569' }]}
            />
            <View
              style={[styles.probBarSegment, { flex: Number(probability.event_AW) || 1, backgroundColor: '#D97706' }]}
            />
          </View>
          <View style={styles.extraRow}>
            <View style={styles.extraChip}>
              <Text style={styles.extraChipLabel}>Over 2.5</Text>
              <Text style={[styles.extraChipValue, { color: '#34D399' }]}>{probability.event_O}%</Text>
            </View>
            <View style={styles.extraChip}>
              <Text style={styles.extraChipLabel}>BTS</Text>
              <Text style={[styles.extraChipValue, { color: '#FBBF24' }]}>{probability.event_bts}%</Text>
            </View>
          </View>
          <Pressable
            style={styles.viewMoreBtn}
            onPress={() => setActiveTab('probabilities')}
          >
            <Text style={styles.viewMoreText}>Full AI Analysis →</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  const renderEvents = () => {
    const hasData =
      (fixture.goalscorers?.length ?? 0) > 0 ||
      (fixture.cards?.length ?? 0) > 0 ||
      (fixture.substitutes?.length ?? 0) > 0;

    if (!hasData) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Events Yet</Text>
          <Text style={styles.emptyText}>Goals, cards and substitutions will appear here.</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {fixture.goalscorers?.map((g, i) => (
          <View key={`g-${i}`} style={[styles.eventRow, styles.eventGoal]}>
            <Text style={styles.eventMin}>{g.time}&apos;</Text>
            <Text style={{ fontSize: 18, marginHorizontal: 8 }}>⚽</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventPlayer}>{g.home_scorer || g.away_scorer}</Text>
              {g.score && <Text style={styles.eventScore}>{g.score}</Text>}
            </View>
          </View>
        ))}
        {fixture.cards?.map((c, i) => {
          const isYellow = c.card?.toLowerCase().includes('yellow');
          return (
            <View key={`c-${i}`} style={[styles.eventRow, styles.eventCard]}>
              <Text style={styles.eventMin}>{c.time}&apos;</Text>
              <View
                style={[
                  styles.cardRect,
                  { backgroundColor: isYellow ? '#FBBF24' : '#EF4444' },
                ]}
              />
              <Text style={[styles.eventPlayer, { flex: 1, marginLeft: 10 }]}>
                {c.home_fault || c.away_fault}
              </Text>
              <Text style={styles.eventCardLabel}>{c.card}</Text>
            </View>
          );
        })}
        {fixture.substitutes?.map((s, i) => {
          const subIn = (s.home_scorer as any)?.in || (s.away_scorer as any)?.in || 'In';
          const subOut = (s.home_scorer as any)?.out || (s.away_scorer as any)?.out || 'Out';
          return (
            <View key={`s-${i}`} style={[styles.eventRow, styles.eventSub]}>
              <Text style={styles.eventMin}>{s.time}&apos;</Text>
              <Text style={{ fontSize: 16, marginHorizontal: 8 }}>🔄</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.eventPlayer, { color: '#34D399' }]}>↑ {subIn}</Text>
                <Text style={[styles.eventPlayer, { color: '#94A3B8', fontSize: 11 }]}>
                  ↓ {subOut}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderLineups = () => {
    if (!homePlayers.length) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Lineups Pending</Text>
          <Text style={styles.emptyText}>
            Starting lineups are announced approximately 60 minutes before kickoff.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        <TacticalPitch
          homeTeamName={fixture.event_home_team}
          awayTeamName={fixture.event_away_team}
          homeFormation={fixture.event_home_formation}
          awayFormation={fixture.event_away_formation}
          homePlayers={homePlayers}
          awayPlayers={awayPlayers}
        />

        {/* Bench */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Substitutes Bench</Text>
          <View style={styles.benchGrid}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.benchTeam, { color: '#60A5FA' }]}>{fixture.event_home_team}</Text>
              {fixture.lineups?.home_team?.substitutes?.map((s, i) => (
                <Text key={i} style={styles.benchPlayer}>
                  #{s.player_number || i + 1} {s.player}
                </Text>
              ))}
            </View>
            <View style={styles.benchDivider} />
            <View style={{ flex: 1, paddingLeft: 10 }}>
              <Text style={[styles.benchTeam, { color: '#FBBF24' }]}>{fixture.event_away_team}</Text>
              {fixture.lineups?.away_team?.substitutes?.map((s, i) => (
                <Text key={i} style={styles.benchPlayer}>
                  #{s.player_number || i + 1} {s.player}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderStats = () => {
    if (!fixture.statistics || fixture.statistics.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>Stats Unavailable</Text>
          <Text style={styles.emptyText}>In-match statistics will update live during gameplay.</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        <View style={[styles.card, { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 4 }]}>
          <Text style={[styles.statsTeam, { color: '#60A5FA' }]}>{fixture.event_home_team}</Text>
          <Text style={[styles.statsTeam, { color: '#FBBF24' }]}>{fixture.event_away_team}</Text>
        </View>
        <View style={styles.card}>
          {fixture.statistics.map((st, i) => {
            const homeVal = parseFloat(st.home as string) || 0;
            const awayVal = parseFloat(st.away as string) || 0;
            const total = homeVal + awayVal || 1;
            const homePct = (homeVal / total) * 100;
            return (
              <View key={i} style={styles.statRow}>
                <Text style={[styles.statValue, { color: '#60A5FA' }]}>{st.home}</Text>
                <View style={{ flex: 1, paddingHorizontal: 8 }}>
                  <Text style={styles.statLabel} numberOfLines={1}>{st.type}</Text>
                  <View style={styles.statBar}>
                    <View style={[styles.statBarHome, { width: `${homePct}%` }]} />
                    <View style={[styles.statBarAway, { width: `${100 - homePct}%` }]} />
                  </View>
                </View>
                <Text style={[styles.statValue, { color: '#FBBF24' }]}>{st.away}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderH2H = () => {
    const matches = h2h?.H2H || [];
    if (!matches.length) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔄</Text>
          <Text style={styles.emptyTitle}>No H2H History</Text>
          <Text style={styles.emptyText}>No previous meetings found between these clubs.</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Previous Encounters</Text>
          {matches.map((m, i) => (
            <Pressable
              key={i}
              style={styles.h2hRow}
              onPress={() => router.push(`/(tabs)/home/football/matches/${m.event_key}` as any)}
            >
              <Text style={styles.h2hDate} numberOfLines={1}>
                {m.event_date} • {m.league_name}
              </Text>
              <View style={styles.h2hMatch}>
                <Text
                  style={[
                    styles.h2hTeam,
                    m.event_home_team === fixture.event_home_team && { color: '#60A5FA' },
                  ]}
                  numberOfLines={1}
                >
                  {m.event_home_team}
                </Text>
                <Text style={styles.h2hScore}>
                  {m.event_final_result || m.event_ft_result || 'VS'}
                </Text>
                <Text
                  style={[
                    styles.h2hTeam,
                    { textAlign: 'right' },
                    m.event_away_team === fixture.event_away_team && { color: '#FBBF24' },
                  ]}
                  numberOfLines={1}
                >
                  {m.event_away_team}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  const renderOdds = () => (
    <View style={styles.tabContent}>
      {/* Live In-Play Odds */}
      {liveOdds.length > 0 && (
        <View style={[styles.card, { borderColor: 'rgba(16,185,129,0.3)' }]}>
          <View style={styles.cardTitleRow}>
            <View style={styles.livePulse} />
            <Text style={[styles.cardTitle, { color: '#34D399' }]}>Live In-Play Odds</Text>
          </View>
          {liveOdds.slice(0, 6).map((lo, i) => (
            <View key={i} style={styles.liveOddsRow}>
              <Text style={styles.liveOddsName} numberOfLines={1}>{lo.odd_name}</Text>
              <Text style={styles.liveOddsType}>{lo.odd_type}</Text>
              <Text style={styles.liveOddsValue}>{lo.odd_value}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Pre-match 1X2 */}
      {odds.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pre-Match 1X2 & Over/Under</Text>
          {/* Table header */}
          <View style={styles.oddsTableHeader}>
            <Text style={[styles.oddsTableCell, styles.oddsBookieCol]}>Bookmaker</Text>
            <Text style={[styles.oddsTableCell, { color: '#60A5FA' }]}>1</Text>
            <Text style={[styles.oddsTableCell, { color: '#CBD5E1' }]}>X</Text>
            <Text style={[styles.oddsTableCell, { color: '#FBBF24' }]}>2</Text>
            <Text style={[styles.oddsTableCell, { color: '#34D399' }]}>O2.5</Text>
            <Text style={[styles.oddsTableCell, { color: '#F87171' }]}>U2.5</Text>
          </View>
          {odds.slice(0, 10).map((o, i) => (
            <View key={i} style={[styles.oddsTableRow, i % 2 === 0 && styles.oddsTableRowAlt]}>
              <Text style={[styles.oddsTableCell, styles.oddsBookieCol]} numberOfLines={1}>
                {o.odd_bookmakers}
              </Text>
              <Text style={[styles.oddsTableCell, { color: '#60A5FA', fontWeight: '900' }]}>
                {o.odd_1 || '-'}
              </Text>
              <Text style={[styles.oddsTableCell, { color: '#CBD5E1' }]}>{o.odd_x || '-'}</Text>
              <Text style={[styles.oddsTableCell, { color: '#FBBF24', fontWeight: '900' }]}>
                {o.odd_2 || '-'}
              </Text>
              <Text style={[styles.oddsTableCell, { color: '#34D399' }]}>
                {o['o+2.5'] || '-'}
              </Text>
              <Text style={[styles.oddsTableCell, { color: '#F87171' }]}>
                {o['u+2.5'] || '-'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Full Odds Markets */}
      {fullOdds && Object.entries(fullOdds).map(([market, marketData]) => (
        <View key={market} style={styles.card}>
          <Text style={styles.cardTitle}>{market}</Text>
          <View style={styles.fullOddsGrid}>
            {Object.entries(marketData).slice(0, 8).map(([outcome, bookies]) => {
              const bk = Object.keys(bookies)[0];
              const val = bookies[bk];
              return (
                <View key={outcome} style={styles.fullOddsChip}>
                  <Text style={styles.fullOddsOutcome} numberOfLines={1}>{outcome}</Text>
                  <Text style={styles.fullOddsVal}>{val}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ))}

      {!liveOdds.length && !odds.length && !fullOdds && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📉</Text>
          <Text style={styles.emptyTitle}>No Odds Available</Text>
          <Text style={styles.emptyText}>Bookmaker odds have not opened yet for this match.</Text>
        </View>
      )}
    </View>
  );

  const renderProbabilities = () => {
    if (!probability) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🤖</Text>
          <Text style={styles.emptyTitle}>Predictions Pending</Text>
          <Text style={styles.emptyText}>Our prediction engine is processing form data.</Text>
        </View>
      );
    }

    const hw = Number(probability.event_HW) || 0;
    const d = Number(probability.event_D) || 0;
    const aw = Number(probability.event_AW) || 0;

    return (
      <View style={styles.tabContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>GoalMills AI Win Probability Matrix</Text>

          <View style={styles.probLabels}>
            <Text style={[styles.probTeam, { color: '#60A5FA' }]}>
              {fixture.event_home_team}{'\n'}{hw}%
            </Text>
            <Text style={[styles.probTeam, { color: '#94A3B8', textAlign: 'center' }]}>
              Draw{'\n'}{d}%
            </Text>
            <Text style={[styles.probTeam, { color: '#FBBF24', textAlign: 'right' }]}>
              {fixture.event_away_team}{'\n'}{aw}%
            </Text>
          </View>

          <View style={styles.probBar}>
            <View style={[styles.probBarSegment, { flex: hw || 1, backgroundColor: '#2563EB' }]} />
            <View style={[styles.probBarSegment, { flex: d || 1, backgroundColor: '#475569' }]} />
            <View style={[styles.probBarSegment, { flex: aw || 1, backgroundColor: '#D97706' }]} />
          </View>

          {/* Full metrics grid */}
          <View style={styles.probMetricGrid}>
            {[
              { label: 'Over 2.5 Goals', value: `${probability.event_O}%`, color: '#34D399' },
              { label: 'Under 2.5 Goals', value: `${probability.event_U}%`, color: '#F87171' },
              { label: 'Both Teams Score', value: `${probability.event_bts}%`, color: '#FBBF24' },
              { label: 'Clean Sheet (OTS)', value: `${probability.event_ots}%`, color: '#67E8F9' },
            ].map((m, i) => (
              <View key={i} style={styles.probMetricCell}>
                <Text style={styles.probMetricLabel}>{m.label}</Text>
                <Text style={[styles.probMetricValue, { color: m.color }]}>{m.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderHighlights = () => {
    if (!videos.length) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎬</Text>
          <Text style={styles.emptyTitle}>No Highlights Yet</Text>
          <Text style={styles.emptyText}>
            Official video highlights will be published after the final whistle.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {videos.map((vid, i) => (
          <View key={i} style={styles.videoCard}>
            <Text style={styles.videoTitle}>{vid.video_title_full || vid.video_title}</Text>
            <Pressable
              style={styles.watchBtn}
              onPress={() => vid.video_url && Linking.openURL(vid.video_url)}
            >
              <Ionicons name="play-circle" size={18} color="#0F172A" />
              <Text style={styles.watchBtnText}>Watch Highlight</Text>
            </Pressable>
          </View>
        ))}
      </View>
    );
  };

  const renderStandings = () => {
    if (!standings.length) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏆</Text>
          <Text style={styles.emptyTitle}>Table Unavailable</Text>
          <Text style={styles.emptyText}>Standings are not available for this competition.</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{fixture.league_name} Table</Text>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableRank]}>#</Text>
            <Text style={[styles.tableCell, { flex: 3 }]}>Club</Text>
            <Text style={[styles.tableCell, styles.tableNum]}>P</Text>
            <Text style={[styles.tableCell, styles.tableNum, { color: '#34D399' }]}>W</Text>
            <Text style={[styles.tableCell, styles.tableNum, { color: '#94A3B8' }]}>D</Text>
            <Text style={[styles.tableCell, styles.tableNum, { color: '#F87171' }]}>L</Text>
            <Text style={[styles.tableCell, styles.tableNum]}>GD</Text>
            <Text style={[styles.tableCell, styles.tableNum, { color: '#FBBF24' }]}>PTS</Text>
          </View>
          {standings.map((row, i) => {
            const isCurrent =
              row.team_key === String(fixture.home_team_key) ||
              row.team_key === String(fixture.away_team_key) ||
              row.standing_team === fixture.event_home_team ||
              row.standing_team === fixture.event_away_team;
            return (
              <View
                key={i}
                style={[styles.tableRow, isCurrent && styles.tableRowHighlight]}
              >
                <Text style={[styles.tableCell, styles.tableRank, { color: '#64748B' }]}>
                  {row.standing_place || i + 1}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 3, fontWeight: '700' },
                    isCurrent && { color: '#FBBF24' },
                  ]}
                  numberOfLines={1}
                >
                  {row.standing_team}
                </Text>
                <Text style={[styles.tableCell, styles.tableNum]}>{row.standing_P || 0}</Text>
                <Text style={[styles.tableCell, styles.tableNum, { color: '#34D399' }]}>
                  {row.standing_W || 0}
                </Text>
                <Text style={[styles.tableCell, styles.tableNum, { color: '#94A3B8' }]}>
                  {row.standing_D || 0}
                </Text>
                <Text style={[styles.tableCell, styles.tableNum, { color: '#F87171' }]}>
                  {row.standing_L || 0}
                </Text>
                <Text style={[styles.tableCell, styles.tableNum]}>{row.standing_GD || 0}</Text>
                <Text style={[styles.tableCell, styles.tableNum, { fontWeight: '900', color: '#FBBF24' }]}>
                  {row.standing_PTS || 0}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'events': return renderEvents();
      case 'lineups': return renderLineups();
      case 'stats': return renderStats();
      case 'h2h': return renderH2H();
      case 'odds': return renderOdds();
      case 'probabilities': return renderProbabilities();
      case 'highlights': return renderHighlights();
      case 'standings': return renderStandings();
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]} // Tab bar sticks
      >
        {/* ── HERO SCORE BANNER ── */}
        <View style={styles.hero}>
          {/* Back button */}
          <Pressable style={styles.heroBack} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#CBD5E1" />
          </Pressable>

          {/* Competition */}
          <View style={styles.heroCompetition}>
            {fixture.league_logo ? (
              <Image source={{ uri: fixture.league_logo }} style={styles.leagueLogo} />
            ) : (
              <Text style={{ fontSize: 14 }}>🏆</Text>
            )}
            <Text style={styles.heroLeague} numberOfLines={1}>{fixture.league_name}</Text>
            {fixture.league_round && (
              <Text style={styles.heroRound}>• {fixture.league_round}</Text>
            )}
          </View>

          {/* Teams & Score */}
          <View style={styles.scoreGrid}>
            {/* Home Team */}
            <Pressable
              style={styles.teamSide}
              onPress={() =>
                fixture.home_team_key &&
                router.push(`/(tabs)/home/football/teams/${fixture.home_team_key}` as any)
              }
            >
              {fixture.home_team_logo ? (
                <Image source={{ uri: fixture.home_team_logo }} style={styles.teamLogo} />
              ) : (
                <View style={[styles.teamLogo, styles.teamLogoPlaceholder]}>
                  <Text>🛡️</Text>
                </View>
              )}
              <Text style={styles.teamName} numberOfLines={2}>{fixture.event_home_team}</Text>
              <Text style={styles.teamRole}>Home</Text>
            </Pressable>

            {/* Score Center */}
            <View style={styles.scoreCentre}>
              <View style={styles.statusBadge}>
                {isLive ? (
                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveBadgeText}>
                      {fixture.event_status || 'LIVE'}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.statusText}>{fixture.event_status || 'NS'}</Text>
                )}
              </View>
              <Text style={styles.scoreText}>{score}</Text>
              {fixture.event_halftime_result && (
                <Text style={styles.htText}>HT: {fixture.event_halftime_result}</Text>
              )}
              {fixture.event_time && (
                <Text style={styles.kickoffTime}>{fixture.event_time}</Text>
              )}
              {fixture.event_stadium && (
                <View style={styles.venueRow}>
                  <Ionicons name="location-outline" size={10} color="#FBBF24" />
                  <Text style={styles.venueText} numberOfLines={1}>{fixture.event_stadium}</Text>
                </View>
              )}
            </View>

            {/* Away Team */}
            <Pressable
              style={[styles.teamSide, { alignItems: 'flex-end' }]}
              onPress={() =>
                fixture.away_team_key &&
                router.push(`/(tabs)/home/football/teams/${fixture.away_team_key}` as any)
              }
            >
              {fixture.away_team_logo ? (
                <Image source={{ uri: fixture.away_team_logo }} style={styles.teamLogo} />
              ) : (
                <View style={[styles.teamLogo, styles.teamLogoPlaceholder]}>
                  <Text>🛡️</Text>
                </View>
              )}
              <Text style={[styles.teamName, { textAlign: 'right' }]} numberOfLines={2}>
                {fixture.event_away_team}
              </Text>
              <Text style={styles.teamRole}>Away</Text>
            </Pressable>
          </View>

          {/* Date strip */}
          <Text style={styles.heroDate}>{fixture.event_date}</Text>
        </View>

        {/* ── STICKY TAB BAR ── */}
        <View style={styles.tabBarWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabBar}
            contentContainerStyle={styles.tabBarContent}
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  style={[styles.tabBtn, active && styles.tabBtnActive]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Ionicons
                    name={tab.icon}
                    size={13}
                    color={active ? '#0F172A' : '#64748B'}
                  />
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ── TAB CONTENT ── */}
        {renderTabContent()}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080E18' },
  scrollView: { flex: 1 },
  centerContainer: {
    flex: 1,
    backgroundColor: '#080E18',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: { color: '#94A3B8', fontSize: 13, marginTop: 12, fontWeight: '600' },
  errorTitle: { fontSize: 20, fontWeight: '900', color: '#F8FAFC', marginBottom: 8 },
  errorSub: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 24 },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
  },
  backBtnText: { color: '#0F172A', fontWeight: '900', fontSize: 13 },

  // ─ Hero ─
  hero: {
    backgroundColor: '#0B1728',
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59,130,246,0.2)',
  },
  heroBack: {
    position: 'absolute',
    top: 52,
    left: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCompetition: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
    marginTop: 4,
  },
  leagueLogo: { width: 20, height: 20, resizeMode: 'contain' },
  heroLeague: { fontSize: 12, fontWeight: '800', color: '#E2E8F0', maxWidth: 200 },
  heroRound: { fontSize: 11, color: '#64748B', fontFamily: 'monospace' },
  scoreGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  teamSide: { flex: 1, alignItems: 'flex-start' },
  teamLogo: { width: 52, height: 52, resizeMode: 'contain', borderRadius: 8 },
  teamLogoPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamName: { fontSize: 13, fontWeight: '900', color: '#F8FAFC', marginTop: 6, lineHeight: 17 },
  teamRole: { fontSize: 10, color: '#64748B', fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  scoreCentre: { alignItems: 'center', minWidth: 100 },
  statusBadge: { marginBottom: 4 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#34D399',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F8FAFC',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  htText: { fontSize: 10, color: '#64748B', fontFamily: 'monospace' },
  kickoffTime: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
    maxWidth: 110,
  },
  venueText: { fontSize: 10, color: '#64748B' },
  heroDate: { textAlign: 'center', color: '#475569', fontSize: 11, marginTop: 10, fontFamily: 'monospace' },

  // ─ Tabs ─
  tabBarWrapper: {
    backgroundColor: '#0B1526',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  tabBar: { flexGrow: 0 },
  tabBarContent: { paddingHorizontal: 8, paddingVertical: 8, gap: 6 },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  tabBtnActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  tabLabel: { fontSize: 11, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  tabLabelActive: { color: '#0F172A' },

  // ─ Shared Content ─
  tabContent: { padding: 12, gap: 12 },
  card: {
    backgroundColor: '#0B1526',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#F8FAFC',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  infoLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  infoValue: { fontSize: 11, color: '#E2E8F0', fontWeight: '800', textAlign: 'right', flex: 1, paddingLeft: 8 },

  // ─ Probability ─
  probLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  probTeam: { fontSize: 11, fontWeight: '800', lineHeight: 16 },
  probBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    marginBottom: 12,
  },
  probBarSegment: { height: '100%' },
  extraRow: { flexDirection: 'row', gap: 8 },
  extraChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 10,
    alignItems: 'center',
  },
  extraChipLabel: { fontSize: 10, color: '#64748B', fontWeight: '700', textTransform: 'uppercase' },
  extraChipValue: { fontSize: 16, fontWeight: '900', marginTop: 2 },
  viewMoreBtn: { marginTop: 12, alignItems: 'flex-end' },
  viewMoreText: { fontSize: 11, color: '#FBBF24', fontWeight: '800' },

  // ─ Events ─
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
  },
  eventGoal: { backgroundColor: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' },
  eventCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' },
  eventSub: { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' },
  eventMin: { fontSize: 11, fontWeight: '900', color: '#FBBF24', width: 30, fontFamily: 'monospace' },
  eventPlayer: { fontSize: 12, fontWeight: '700', color: '#E2E8F0' },
  eventScore: { fontSize: 11, color: '#34D399', fontFamily: 'monospace', fontWeight: '900', marginTop: 2 },
  eventCardLabel: { fontSize: 10, color: '#94A3B8', marginLeft: 4 },
  cardRect: { width: 12, height: 16, borderRadius: 2, marginHorizontal: 8 },

  // ─ Bench ─
  benchGrid: { flexDirection: 'row' },
  benchDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 10 },
  benchTeam: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', marginBottom: 6 },
  benchPlayer: { fontSize: 11, color: '#CBD5E1', lineHeight: 20, fontFamily: 'monospace' },

  // ─ Stats ─
  statsTeam: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 12, fontWeight: '900', width: 36, fontFamily: 'monospace', textAlign: 'center' },
  statLabel: { fontSize: 10, color: '#64748B', textAlign: 'center', textTransform: 'uppercase', marginBottom: 3 },
  statBar: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: '#1E293B' },
  statBarHome: { backgroundColor: '#2563EB', height: '100%' },
  statBarAway: { backgroundColor: '#D97706', height: '100%' },

  // ─ H2H ─
  h2hRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  h2hDate: { fontSize: 10, color: '#475569', fontFamily: 'monospace', marginBottom: 4 },
  h2hMatch: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  h2hTeam: { flex: 1, fontSize: 12, fontWeight: '700', color: '#CBD5E1' },
  h2hScore: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FBBF24',
    fontFamily: 'monospace',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginHorizontal: 8,
  },

  // ─ Odds ─
  livePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 4 },
  liveOddsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  liveOddsName: { flex: 2, fontSize: 11, color: '#94A3B8' },
  liveOddsType: { flex: 1, fontSize: 11, color: '#E2E8F0', fontWeight: '700', textAlign: 'center' },
  liveOddsValue: { flex: 1, fontSize: 16, fontWeight: '900', color: '#34D399', textAlign: 'right', fontFamily: 'monospace' },
  oddsTableHeader: {
    flexDirection: 'row',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 4,
  },
  oddsTableRow: { flexDirection: 'row', paddingVertical: 7 },
  oddsTableRowAlt: { backgroundColor: 'rgba(255,255,255,0.02)' },
  oddsTableCell: { flex: 1, textAlign: 'center', fontSize: 11, color: '#94A3B8', fontFamily: 'monospace' },
  oddsBookieCol: { flex: 2, textAlign: 'left', color: '#CBD5E1', fontWeight: '700', fontFamily: 'System' },
  fullOddsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  fullOddsChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: (SCREEN_WIDTH - 32 - 28 - 12) / 2,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  fullOddsOutcome: { fontSize: 10, color: '#94A3B8', flex: 1 },
  fullOddsVal: { fontSize: 12, fontWeight: '900', color: '#FBBF24', fontFamily: 'monospace' },

  // ─ Probabilities ─
  probMetricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  probMetricCell: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    alignItems: 'center',
  },
  probMetricLabel: { fontSize: 10, color: '#64748B', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' },
  probMetricValue: { fontSize: 22, fontWeight: '900', marginTop: 4, fontVariant: ['tabular-nums'] },

  // ─ Video ─
  videoCard: {
    backgroundColor: '#0B1526',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginBottom: 10,
  },
  videoTitle: { fontSize: 13, fontWeight: '700', color: '#E2E8F0', marginBottom: 10, lineHeight: 18 },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  watchBtnText: { fontSize: 12, fontWeight: '900', color: '#0F172A' },

  // ─ Standings Table ─
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 2,
  },
  tableRow: { flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  tableRowHighlight: { backgroundColor: 'rgba(245,158,11,0.1)' },
  tableCell: { fontSize: 11, color: '#CBD5E1', fontFamily: 'monospace' },
  tableRank: { width: 24, textAlign: 'center' },
  tableNum: { width: 30, textAlign: 'center' },

  // ─ Empty States ─
  emptyContainer: { padding: 48, alignItems: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontWeight: '900', color: '#F8FAFC', marginBottom: 6 },
  emptyText: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18 },
});
