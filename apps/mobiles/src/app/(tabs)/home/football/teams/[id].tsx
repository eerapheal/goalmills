import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { FootballTeam, FootballPlayer, FootballEvent, FootballStanding } from '@goalmills/types';
import { advancedFootballApi } from '../../../../../services/advancedFootballApi';
import { FootballMatchCard } from '../../../../../components/FootballMatchCard';
import { MatchOddsModal } from '../../../../../components/MatchOddsModal';
import { UnifiedMatchEvent } from '../../../../../components/FootballMatchCard';
import { resolveFootballTeam } from '../../../../../lib/football/teamResolver';
import { getTopLeagueSlug } from '../../../../../lib/football/topLeagues';
import { slugify, buildTeamSlug } from '../../../../../lib/slugUtils';
import {
  MatchCardSkeleton,
  StandingsTableSkeleton,
  PlayerCardSkeleton,
} from '../../../../../components/football';

type TeamTab = 'squad' | 'fixtures' | 'results' | 'table' | 'odds';

const POSITION_ORDER = ['Goalkeepers', 'Defenders', 'Midfielders', 'Forwards', 'Unknown'];

const normalisePosition = (pos: string | undefined): string => {
  if (!pos) return 'Unknown';
  const p = pos.toLowerCase();
  if (p.includes('goal')) return 'Goalkeepers';
  if (p.includes('def')) return 'Defenders';
  if (p.includes('mid')) return 'Midfielders';
  if (p.includes('for') || p.includes('att') || p.includes('win')) return 'Forwards';
  return pos.charAt(0).toUpperCase() + pos.slice(1);
};

const toUnified = (f: FootballEvent): UnifiedMatchEvent => ({
  event_key: f.event_key,
  event_date: f.event_date,
  event_time: f.event_time,
  event_status: f.event_status,
  event_live: f.event_live,
  event_home_team: f.event_home_team,
  home_team_key: f.home_team_key,
  home_team_logo: f.home_team_logo,
  event_away_team: f.event_away_team,
  away_team_key: f.away_team_key,
  away_team_logo: f.away_team_logo,
  event_final_result: f.event_final_result,
  event_ft_result: f.event_ft_result,
  league_name: f.league_name,
  league_key: f.league_key,
  league_logo: f.league_logo,
});

export default function TeamDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TeamTab>('squad');
  const [team, setTeam] = useState<FootballTeam | null>(null);
  const [leagueName, setLeagueName] = useState<string>('');
  const [leagueSlug, setLeagueSlug] = useState<string>('');
  const [leagueId, setLeagueId] = useState<number | undefined>(undefined);
  const [players, setPlayers] = useState<FootballPlayer[]>([]);
  const [allFixtures, setAllFixtures] = useState<FootballEvent[]>([]);
  const [standings, setStandings] = useState<FootballStanding[]>([]);
  const [oddsModal, setOddsModal] = useState<{
    visible: boolean;
    matchId: string;
    home: string;
    away: string;
  }>({
    visible: false,
    matchId: '',
    home: '',
    away: '',
  });

  useEffect(() => {
    loadTeamData();
  }, [id]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const rawId = String(id || '').trim();
      const resolved = await resolveFootballTeam(rawId);

      if (resolved) {
        setTeam(resolved.team);
        if (resolved.leagueName) setLeagueName(resolved.leagueName);
        if (resolved.leagueSlug) setLeagueSlug(resolved.leagueSlug);
        if (resolved.leagueId) setLeagueId(resolved.leagueId);

        const teamKey = resolved.teamKey;
        let squad = Array.isArray(resolved.team.players) ? resolved.team.players : [];

        const today = new Date();
        const currentYear = today.getFullYear();
        const seasonStart = today.getMonth() < 6 ? currentYear - 1 : currentYear;
        const fromDate = `${seasonStart}-07-01`;
        const toDate = `${seasonStart + 1}-06-30`;

        const promises: Promise<any>[] = [
          advancedFootballApi
            .getFixtures({ from: fromDate, to: toDate, teamId: teamKey })
            .catch(() => ({ result: [] })),
        ];
        if (squad.length === 0) {
          promises.push(
            advancedFootballApi.getPlayers({ teamId: teamKey }).catch(() => ({ result: [] }))
          );
        }

        const [fixturesRes, playersRes] = await Promise.all(promises);
        const rawFixtures = (fixturesRes?.result as FootballEvent[]) || [];
        setAllFixtures(rawFixtures);

        if (playersRes?.result && Array.isArray(playersRes.result) && playersRes.result.length > 0) {
          squad = playersRes.result;
        }
        setPlayers(squad);

        // Fetch standings using resolved.leagueId or fixture league_key
        const activeLeagueId = resolved.leagueId || Number(rawFixtures[0]?.league_key);
        if (activeLeagueId && !isNaN(activeLeagueId)) {
          setLeagueId(activeLeagueId);
          if (!resolved.leagueName && rawFixtures[0]?.league_name) {
            const lName = rawFixtures[0].league_name;
            const cName = rawFixtures[0].country_name;
            const isGenericPL =
              lName.toLowerCase() === 'premier league' && cName && cName.toLowerCase() !== 'england';
            const disambiguated = isGenericPL ? `${cName} Premier League` : lName;
            setLeagueName(disambiguated);
            setLeagueSlug(getTopLeagueSlug(activeLeagueId) || slugify(disambiguated));
          }
          const standRes = await advancedFootballApi.getStandings(activeLeagueId).catch(() => null);
          if (standRes?.result) {
            const res = standRes.result as any;
            const table = Array.isArray(res) ? res : res.total || [];
            setStandings(table);
          }
        }
      } else {
        // Fallback for purely numeric or unresolvable ID
        const numId = Number(id);
        if (!isNaN(numId)) {
          const today = new Date();
          const currentYear = today.getFullYear();
          const seasonStart = today.getMonth() < 6 ? currentYear - 1 : currentYear;
          const fromDate = `${seasonStart}-07-01`;
          const toDate = `${seasonStart + 1}-06-30`;

          const [teamsRes, playersRes, fixturesRes] = await Promise.all([
            advancedFootballApi.getTeams({ teamId: numId }).catch(() => ({ result: [] })),
            advancedFootballApi.getPlayers({ teamId: numId }).catch(() => ({ result: [] })),
            advancedFootballApi
              .getFixtures({ from: fromDate, to: toDate, teamId: numId })
              .catch(() => ({ result: [] })),
          ]);

          const foundTeam = teamsRes?.result?.[0] || null;
          setTeam(foundTeam);
          setPlayers(playersRes?.result || []);
          const rawFixtures = (fixturesRes?.result as FootballEvent[]) || [];
          setAllFixtures(rawFixtures);

          if (rawFixtures[0]?.league_key) {
            const actLgId = Number(rawFixtures[0].league_key);
            setLeagueId(actLgId);
            const lName = rawFixtures[0].league_name || '';
            const cName = rawFixtures[0].country_name || '';
            const isGenericPL =
              lName.toLowerCase() === 'premier league' && cName && cName.toLowerCase() !== 'england';
            const disambiguated = isGenericPL ? `${cName} Premier League` : lName;
            setLeagueName(disambiguated);
            setLeagueSlug(getTopLeagueSlug(actLgId) || slugify(disambiguated));

            const standRes = await advancedFootballApi.getStandings(actLgId).catch(() => null);
            if (standRes?.result) {
              const res = standRes.result as any;
              const table = Array.isArray(res) ? res : res.total || [];
              setStandings(table);
            }
          }
        } else {
          setTeam(null);
        }
      }
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTeamData();
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  };

  // Compute derived fixtures
  const now = new Date().toISOString().split('T')[0];
  const results = useMemo(
    () =>
      allFixtures
        .filter(
          (f) =>
            f.event_status === 'FT' || f.event_status === 'Finished' || f.event_status === 'AET'
        )
        .slice(-10)
        .reverse(),
    [allFixtures]
  );
  const upcoming = useMemo(
    () =>
      allFixtures
        .filter(
          (f) =>
            Boolean(f.event_date && f.event_date >= now) &&
            (f.event_status === 'NS' ||
              f.event_status === 'Not Started' ||
              f.event_status === 'TBA')
        )
        .slice(0, 10),
    [allFixtures, now]
  );

  // Form (last 5 from results)
  const formBadges = useMemo(() => {
    return results.slice(0, 5).map((f) => {
      const teamId = String(id);
      const homeId = String(f.home_team_key);
      const awayId = String(f.away_team_key);
      const scoreParts = (f.event_final_result || f.event_ft_result || '-').split(' - ');
      const homeGoals = parseInt(scoreParts[0] || '0', 10);
      const awayGoals = parseInt(scoreParts[1] || '0', 10);
      let outcome: 'W' | 'D' | 'L' = 'D';
      if (teamId === homeId)
        outcome = homeGoals > awayGoals ? 'W' : homeGoals < awayGoals ? 'L' : 'D';
      else if (teamId === awayId)
        outcome = awayGoals > homeGoals ? 'W' : awayGoals < homeGoals ? 'L' : 'D';
      return outcome;
    });
  }, [results, id]);

  // Group players by position
  const groupedPlayers = useMemo(() => {
    const groups: { [k: string]: FootballPlayer[] } = {};
    players.forEach((p) => {
      const pos = normalisePosition(p.player_type);
      if (!groups[pos]) groups[pos] = [];
      groups[pos].push(p);
    });
    return groups;
  }, [players]);

  // Current team standing
  const myStanding = standings.find((s) => String(s.team_key) === String(id));

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: '#080E18', padding: 16 }}>
        <PlayerCardSkeleton />
        <MatchCardSkeleton />
        <StandingsTableSkeleton />
      </View>
    );
  }

  if (!team) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 40 }}>🛡️</Text>
        <Text style={styles.errorTitle}>Team Not Found</Text>
        <Pressable style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>← Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const TABS: { id: TeamTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'squad', label: 'Squad', icon: 'people-outline' },
    { id: 'fixtures', label: 'Upcoming', icon: 'calendar-outline' },
    { id: 'results', label: 'Results', icon: 'checkmark-circle-outline' },
    { id: 'table', label: 'Table', icon: 'trophy-outline' },
    { id: 'odds', label: 'AI Odds', icon: 'analytics-outline' },
  ];

  const formColor = (o: 'W' | 'D' | 'L') =>
    o === 'W' ? '#34D399' : o === 'D' ? '#94A3B8' : '#F87171';

  return (
    <View style={styles.container}>
      {/* ── HERO ── */}
      <View style={styles.hero}>
        <Pressable onPress={handleBack} style={styles.heroBack}>
          <Ionicons name="arrow-back" size={20} color="#F8FAFC" />
        </Pressable>

        <View style={styles.heroContent}>
          {team.team_logo ? (
            <Image source={{ uri: team.team_logo }} style={styles.teamLogo} />
          ) : (
            <View style={[styles.teamLogo, styles.teamLogoPlaceholder]}>
              <Text style={{ fontSize: 36 }}>🛡️</Text>
            </View>
          )}
          <View style={styles.heroInfo}>
            <Text style={styles.teamName}>{team.team_name}</Text>
            {/* Clickable League Pill */}
            {leagueName ? (
              <Pressable
                style={styles.leaguePill}
                onPress={() => {
                  const target =
                    leagueSlug || (leagueId ? getTopLeagueSlug(leagueId) || String(leagueId) : '');
                  if (target) {
                    router.push(`/(tabs)/home/football/leagues/${target}` as any);
                  }
                }}
              >
                <Text style={styles.leaguePillText} numberOfLines={1}>
                  🏆 {leagueName}
                </Text>
                <Ionicons name="chevron-forward" size={11} color="#60A5FA" />
              </Pressable>
            ) : null}
            {/* Form row */}
            {formBadges.length > 0 && (
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Form:</Text>
                {formBadges.map((o, i) => (
                  <View key={i} style={[styles.formDot, { backgroundColor: formColor(o) }]}>
                    <Text style={styles.formLetter}>{o}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Standing card */}
        {myStanding && (
          <View style={styles.standingCard}>
            <View style={styles.standingItem}>
              <Text style={styles.standingValue}>{myStanding.standing_place}</Text>
              <Text style={styles.standingKey}>Rank</Text>
            </View>
            <View style={styles.standingDivider} />
            <View style={styles.standingItem}>
              <Text style={[styles.standingValue, { color: '#34D399' }]}>
                {myStanding.standing_W || 0}
              </Text>
              <Text style={styles.standingKey}>W</Text>
            </View>
            <View style={styles.standingItem}>
              <Text style={[styles.standingValue, { color: '#94A3B8' }]}>
                {myStanding.standing_D || 0}
              </Text>
              <Text style={styles.standingKey}>D</Text>
            </View>
            <View style={styles.standingItem}>
              <Text style={[styles.standingValue, { color: '#F87171' }]}>
                {myStanding.standing_L || 0}
              </Text>
              <Text style={styles.standingKey}>L</Text>
            </View>
            <View style={styles.standingDivider} />
            <View style={styles.standingItem}>
              <Text style={[styles.standingValue, { color: '#FBBF24' }]}>
                {myStanding.standing_PTS || 0}
              </Text>
              <Text style={styles.standingKey}>PTS</Text>
            </View>
          </View>
        )}
      </View>

      {/* ── TAB BAR ── */}
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
              <Ionicons name={tab.icon} size={13} color={active ? '#0F172A' : '#64748B'} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── CONTENT ── */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />
        }
        contentContainerStyle={{ padding: 12, paddingBottom: 100, gap: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── SQUAD ── */}
        {activeTab === 'squad' && (
          <>
            {players.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={{ fontSize: 36 }}>👥</Text>
                <Text style={styles.emptyTitle}>Squad Unavailable</Text>
              </View>
            ) : (
              POSITION_ORDER.filter((pos) => groupedPlayers[pos]?.length > 0).map((pos) => (
                <View key={pos} style={styles.positionGroup}>
                  <Text style={styles.positionTitle}>{pos}</Text>
                  {groupedPlayers[pos].map((p, i) => (
                    <Pressable
                      key={i}
                      style={styles.playerRow}
                      onPress={() =>
                        p.player_key &&
                        router.push(`/(tabs)/home/football/players/${p.player_key}` as any)
                      }
                    >
                      {p.player_image ? (
                        <Image source={{ uri: p.player_image }} style={styles.playerThumb} />
                      ) : (
                        <View style={[styles.playerThumb, styles.playerThumbPlaceholder]}>
                          <Text>👤</Text>
                        </View>
                      )}
                      <View style={styles.playerInfo}>
                        <Text style={styles.playerName}>{p.player_name}</Text>
                        <Text style={styles.playerMeta}>
                          {p.player_country || 'N/A'} · Age {p.player_age || '?'}
                        </Text>
                      </View>
                      <View style={styles.playerStats}>
                        <Text style={styles.playerGoals}>{p.player_goals || 0} ⚽</Text>
                        {p.player_rating && (
                          <Text style={styles.playerRating}>
                            ★ {Number(p.player_rating).toFixed(1)}
                          </Text>
                        )}
                      </View>
                      <Text style={styles.playerNumber}>#{p.player_number || '?'}</Text>
                    </Pressable>
                  ))}
                </View>
              ))
            )}
          </>
        )}

        {/* ── UPCOMING FIXTURES ── */}
        {activeTab === 'fixtures' && (
          <>
            {upcoming.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={{ fontSize: 36 }}>📅</Text>
                <Text style={styles.emptyTitle}>No Upcoming Fixtures</Text>
              </View>
            ) : (
              upcoming.map((f) => <FootballMatchCard key={f.event_key} event={toUnified(f)} />)
            )}
          </>
        )}

        {/* ── RESULTS ── */}
        {activeTab === 'results' && (
          <>
            {results.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={{ fontSize: 36 }}>📋</Text>
                <Text style={styles.emptyTitle}>No Results Yet</Text>
              </View>
            ) : (
              results.map((f) => <FootballMatchCard key={f.event_key} event={toUnified(f)} />)
            )}
          </>
        )}

        {/* ── TABLE ── */}
        {activeTab === 'table' && (
          <View style={styles.tableCard}>
            {standings.length === 0 ? (
              <Text style={styles.emptyTitle}>Standings unavailable.</Text>
            ) : (
              <>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, styles.rankCol]}>#</Text>
                  <Text style={[styles.tableCell, { flex: 2.5, textAlign: 'left' }]}>Club</Text>
                  <Text style={[styles.tableCell, styles.numCol]}>P</Text>
                  <Text style={[styles.tableCell, styles.numCol, { color: '#34D399' }]}>W</Text>
                  <Text style={[styles.tableCell, styles.numCol, { color: '#94A3B8' }]}>D</Text>
                  <Text style={[styles.tableCell, styles.numCol, { color: '#F87171' }]}>L</Text>
                  <Text style={[styles.tableCell, styles.numCol]}>GD</Text>
                  <Text style={[styles.tableCell, styles.numCol, { color: '#FBBF24' }]}>PTS</Text>
                </View>
                {standings.map((row, i) => {
                  const isMe =
                    String(row.team_key) === String(id) || row.standing_team === team.team_name;
                  const rank = Number(row.standing_place) || i + 1;
                  const isLeader = rank === 1;
                  const isUCL = rank >= 1 && rank <= 4;
                  const isUEL = rank === 5;
                  const isUECL = rank === 6;
                  const isRel =
                    standings.length > 10 ? rank >= standings.length - 2 : rank >= 18;

                  return (
                    <Pressable
                      key={i}
                      style={[
                        styles.tableRow,
                        isMe && styles.tableRowHighlight,
                        isUCL && styles.tableRowUCL,
                        isUEL && styles.tableRowUEL,
                        isUECL && styles.tableRowUECL,
                        isRel && styles.tableRowRel,
                      ]}
                      onPress={() => {
                        if (row.team_key) {
                          const slug = buildTeamSlug(row.standing_team, row.team_key);
                          router.push(`/home/football/teams/${slug}` as any);
                        }
                      }}
                    >
                      <View
                        style={[
                          styles.rankBadge,
                          isLeader && styles.leaderBadge,
                          !isLeader && isUCL && styles.uclBadge,
                          isUEL && styles.uelBadge,
                          isUECL && styles.ueclBadge,
                          isRel && styles.relBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.rankBadgeText,
                            isLeader && { color: '#FBBF24', fontWeight: '900' },
                            !isLeader && isUCL && { color: '#60A5FA' },
                            isUEL && { color: '#FBBF24' },
                            isUECL && { color: '#34D399' },
                            isRel && { color: '#F87171' },
                          ]}
                        >
                          {row.standing_place || i + 1}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.tableCell,
                          {
                            flex: 2.5,
                            textAlign: 'left',
                            fontWeight: '700',
                            color: isMe ? '#FBBF24' : '#F1F5F9',
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {row.standing_team}
                      </Text>
                      <Text style={[styles.tableCell, styles.numCol]}>{row.standing_P || 0}</Text>
                      <Text style={[styles.tableCell, styles.numCol, { color: '#34D399' }]}>
                        {row.standing_W || 0}
                      </Text>
                      <Text style={[styles.tableCell, styles.numCol, { color: '#94A3B8' }]}>
                        {row.standing_D || 0}
                      </Text>
                      <Text style={[styles.tableCell, styles.numCol, { color: '#F87171' }]}>
                        {row.standing_L || 0}
                      </Text>
                      <Text style={[styles.tableCell, styles.numCol]}>{row.standing_GD || 0}</Text>
                      <View style={styles.ptsPillContainer}>
                        <Text
                          style={[
                            styles.tableCell,
                            styles.numCol,
                            { fontWeight: '900', color: '#FBBF24' },
                          ]}
                        >
                          {row.standing_PTS || 0}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}

                {/* Zone Legend */}
                <View style={styles.zoneLegend}>
                  <View style={styles.zoneLegendItem}>
                    <View style={[styles.zoneLegendDot, { backgroundColor: '#3B82F6' }]} />
                    <Text style={styles.zoneLegendText}>1-4: UCL</Text>
                  </View>
                  <View style={styles.zoneLegendItem}>
                    <View style={[styles.zoneLegendDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.zoneLegendText}>5: UEL</Text>
                  </View>
                  <View style={styles.zoneLegendItem}>
                    <View style={[styles.zoneLegendDot, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.zoneLegendText}>6: UECL</Text>
                  </View>
                  <View style={styles.zoneLegendItem}>
                    <View style={[styles.zoneLegendDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={styles.zoneLegendText}>Relegation</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        {/* ── AI ODDS / PREDICTIONS ── */}
        {activeTab === 'odds' && (
          <>
            <Text style={styles.oddsTitle}>Tap a fixture to preview odds & AI prediction</Text>
            {upcoming.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={{ fontSize: 36 }}>📉</Text>
                <Text style={styles.emptyTitle}>No Upcoming Fixtures</Text>
                <Text style={styles.emptyText}>Odds are available for future matches.</Text>
              </View>
            ) : (
              upcoming.map((f) => (
                <Pressable
                  key={f.event_key}
                  style={styles.oddsFixtureRow}
                  onPress={() =>
                    setOddsModal({
                      visible: true,
                      matchId: String(f.event_key),
                      home: f.event_home_team,
                      away: f.event_away_team,
                    })
                  }
                >
                  <View style={styles.oddsFixtureInfo}>
                    <Text style={styles.oddsFixtureDate}>
                      {f.event_date} · {f.event_time || 'TBA'}
                    </Text>
                    <Text style={styles.oddsFixtureTeams}>
                      {f.event_home_team} <Text style={{ color: '#475569' }}>vs</Text>{' '}
                      {f.event_away_team}
                    </Text>
                    <Text style={styles.oddsFixtureLeague} numberOfLines={1}>
                      {f.league_name}
                    </Text>
                  </View>
                  <Ionicons name="analytics-outline" size={20} color="#F59E0B" />
                </Pressable>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Odds Modal */}
      <MatchOddsModal
        visible={oddsModal.visible}
        matchId={oddsModal.matchId}
        homeTeam={oddsModal.home}
        awayTeam={oddsModal.away}
        onClose={() => setOddsModal((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080E18' },
  center: {
    flex: 1,
    backgroundColor: '#080E18',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  loadingText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  errorTitle: { fontSize: 18, fontWeight: '900', color: '#F8FAFC', marginTop: 8 },
  backBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
  },
  backBtnText: { color: '#0F172A', fontWeight: '900', fontSize: 13 },

  // Hero
  hero: {
    backgroundColor: '#0D1F3C',
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59,130,246,0.25)',
  },
  heroBack: {
    position: 'absolute',
    top: 52,
    left: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: { flexDirection: 'row', gap: 14, alignItems: 'center', paddingLeft: 44 },
  teamLogo: { width: 72, height: 72, resizeMode: 'contain', borderRadius: 8 },
  teamLogoPlaceholder: {
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroInfo: { flex: 1 },
  teamName: { fontSize: 20, fontWeight: '900', color: '#F8FAFC' },
  teamCountry: { fontSize: 12, color: '#64748B', marginTop: 2 },
  leaguePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
    alignSelf: 'flex-start',
    gap: 4,
  },
  leaguePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#93C5FD',
  },
  formRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  formLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  formDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formLetter: { fontSize: 10, fontWeight: '900', color: '#0F172A' },

  standingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    marginTop: 14,
    justifyContent: 'space-around',
  },
  standingItem: { alignItems: 'center' },
  standingValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F8FAFC',
    fontVariant: ['tabular-nums'],
  },
  standingKey: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  standingDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },

  // Tabs
  tabBar: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  tabBarContent: { paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  tabBtnActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  tabLabel: { fontSize: 11, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  tabLabelActive: { color: '#0F172A' },

  // Squad
  positionGroup: {
    backgroundColor: '#0B1526',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  positionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#60A5FA',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  playerThumb: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E293B' },
  playerThumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 12, fontWeight: '800', color: '#F1F5F9' },
  playerMeta: { fontSize: 10, color: '#64748B', marginTop: 1 },
  playerStats: { alignItems: 'flex-end', gap: 2 },
  playerGoals: { fontSize: 11, fontWeight: '700', color: '#34D399' },
  playerRating: { fontSize: 10, color: '#FBBF24', fontWeight: '700' },
  playerNumber: {
    fontSize: 11,
    fontWeight: '900',
    color: '#475569',
    width: 28,
    textAlign: 'right',
    fontFamily: 'monospace',
  },

  // Table
  tableCard: {
    backgroundColor: '#0B1526',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  tableRowHighlight: { backgroundColor: 'rgba(245,158,11,0.1)' },
  tableRowUCL: {
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  tableRowUEL: {
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  tableRowUECL: {
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  tableRowRel: {
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  rankBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  leaderBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.45)',
  },
  uclBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
  },
  uelBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  ueclBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  relBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  rankBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  ptsPillContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  zoneLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  zoneLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  zoneLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  zoneLegendText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tableCell: { fontSize: 11, color: '#94A3B8', fontFamily: 'monospace', textAlign: 'center' },
  rankCol: { width: 26 },
  numCol: { width: 28, textAlign: 'center' },

  // Odds
  oddsTitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingBottom: 4,
    letterSpacing: 0.5,
  },
  oddsFixtureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1526',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
  },
  oddsFixtureInfo: { flex: 1 },
  oddsFixtureDate: {
    fontSize: 10,
    color: '#FBBF24',
    fontFamily: 'monospace',
    fontWeight: '700',
    marginBottom: 4,
  },
  oddsFixtureTeams: { fontSize: 13, fontWeight: '800', color: '#F1F5F9', marginBottom: 3 },
  oddsFixtureLeague: { fontSize: 10, color: '#64748B' },

  // Empty
  emptyContainer: { padding: 48, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '900', color: '#F8FAFC' },
  emptyText: { fontSize: 12, color: '#64748B', textAlign: 'center' },
});
