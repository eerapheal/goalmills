import { useState, useEffect } from 'react';
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
import {
  FootballLeague,
  FootballEvent,
  FootballStanding,
  FootballTopscorer,
  FootballTeam,
  FootballProbability,
} from '@goalmills/types';
import { advancedFootballApi } from '../../../../../services/advancedFootballApi';
import { FootballMatchCard } from '../../../../../components/FootballMatchCard';
import { resolveLeagueId, buildTeamSlug, buildMatchSlug } from '../../../../../lib/slugUtils';
import { getCanonicalCompetition } from '../../../../../lib/football/competitionRegistry';
import { getLeagueShortName } from '../../../../../lib/football/topLeagues';
import {
  StandingsTableSkeleton,
  MatchCardSkeleton,
  LeagueRibbonSkeleton,
} from '../../../../../components/football';

type LeagueTab = 'fixtures' | 'results' | 'standings' | 'topscorers' | 'teams' | 'predictions';

export default function LeagueDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<LeagueTab>('fixtures');
  const [standingView, setStandingView] = useState<'total' | 'home' | 'away'>('total');
  const [league, setLeague] = useState<FootballLeague | null>(null);
  const [fixtures, setFixtures] = useState<FootballEvent[]>([]);
  const [standings, setStandings] = useState<{ name: string; teams: FootballStanding[] }[]>([]);
  const [topscorers, setTopscorers] = useState<FootballTopscorer[]>([]);
  const [teams, setTeams] = useState<FootballTeam[]>([]);
  const [probabilities, setProbabilities] = useState<FootballProbability[]>([]);

  useEffect(() => {
    loadLeagueData();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadLeagueData();
  };

  const loadLeagueData = async () => {
    try {
      const resolvedId = resolveLeagueId(id as string);
      const leagueId = resolvedId ?? (!isNaN(Number(id)) ? Number(id) : NaN);
      const canonical =
        getCanonicalCompetition(String(id)) ||
        (resolvedId ? getCanonicalCompetition(String(resolvedId)) : undefined);

      const today = new Date();
      const currentYear = today.getFullYear();

      // Fetch a wider range to ensure we capture the full current/upcoming season regardless of league schedule type
      const fromDate = `${currentYear - 1}-01-01`;
      const toDate = `${currentYear + 2}-01-01`;

      const [leaguesRes, fixturesRes, standingsRes, topscorersRes, teamsRes] = await Promise.all([
        !isNaN(leagueId)
          ? advancedFootballApi.getLeagues(undefined, leagueId).catch(() => ({ result: [] }))
          : Promise.resolve({ result: [] }),
        !isNaN(leagueId)
          ? advancedFootballApi
              .getFixtures({
                from: fromDate,
                to: toDate,
                leagueId: leagueId,
              })
              .catch(() => ({ result: [] }))
          : Promise.resolve({ result: [] }),
        !isNaN(leagueId)
          ? advancedFootballApi.getStandings(leagueId).catch(() => ({ result: { total: [] } }))
          : Promise.resolve({ result: { total: [] } }),
        !isNaN(leagueId)
          ? advancedFootballApi.getTopscorers(leagueId).catch(() => ({ result: [] }))
          : Promise.resolve({ result: [] }),
        !isNaN(leagueId)
          ? advancedFootballApi.getTeams({ leagueId: leagueId }).catch(() => ({ result: [] }))
          : Promise.resolve({ result: [] }),
      ]);

      const leagues = leaguesRes.result || [];
      let foundLeague = leagues.find(
        (l) =>
          String(l.league_key) === String(leagueId) ||
          String(l.league_key) === String(id)
      );

      let rawFixtures = fixturesRes.result || [];

      let latestSeason: string | null = null;
      if (rawFixtures.length > 0) {
        // Collect all unique seasons
        const seasons = Array.from(
          new Set(rawFixtures.map((f) => f.league_season).filter((s): s is string => Boolean(s)))
        );
        if (seasons.length > 0) {
          // Sort seasons descending
          seasons.sort((a, b) => {
            return (b || '').localeCompare(a || '', undefined, { numeric: true, sensitivity: 'base' });
          });
          latestSeason = seasons[0] || null;
          console.log(`Mobile: Filtering league ${id} for latest season: ${latestSeason}`);
          rawFixtures = rawFixtures.filter((f) => f.league_season === latestSeason);
        }
      }

      // Disambiguate if found in API
      if (foundLeague) {
        const isGenericPL =
          foundLeague.league_name?.toLowerCase() === 'premier league' &&
          foundLeague.country_name?.toLowerCase() !== 'england';
        if (isGenericPL && foundLeague.country_name) {
          foundLeague = {
            ...foundLeague,
            league_name: `${foundLeague.country_name} Premier League`,
          };
        } else if (canonical?.name) {
          foundLeague = {
            ...foundLeague,
            league_name: canonical.name,
          };
        }

        if (canonical?.logoUrl && (!foundLeague.league_logo || foundLeague.league_logo.includes('allsportsapi.com/logo/logo_leagues'))) {
          foundLeague = {
            ...foundLeague,
            league_logo: canonical.logoUrl,
          };
        }
      }

      // If league not found in leagues list, try canonical registry
      if (!foundLeague && canonical) {
        foundLeague = {
          league_key: String(canonical.providerId || leagueId || id),
          league_name: canonical.name,
          league_logo: canonical.logoUrl || '',
          country_key: canonical.countryCode || '',
          country_name: canonical.countryName || '',
          country_logo: canonical.countryFlagUrl || '',
        } as FootballLeague;
      }

      // If still not found, try to get it from fixtures
      if (!foundLeague && rawFixtures.length > 0) {
        const firstFixture = rawFixtures[0];
        const isGenericPL =
          firstFixture.league_name?.toLowerCase() === 'premier league' &&
          firstFixture.country_name?.toLowerCase() !== 'england';
        const name =
          isGenericPL && firstFixture.country_name
            ? `${firstFixture.country_name} Premier League`
            : firstFixture.league_name;
        const fixtureLogo =
          firstFixture.league_logo && !firstFixture.league_logo.includes('allsportsapi.com/logo/logo_leagues')
            ? firstFixture.league_logo
            : canonical?.logoUrl || '';
        foundLeague = {
          league_key: String(leagueId || id),
          league_name: name,
          league_logo: fixtureLogo,
          country_key: firstFixture.event_country_key || '',
          country_name: firstFixture.country_name,
          country_logo: firstFixture.country_logo || '',
        } as FootballLeague;
      }
      setLeague(foundLeague || null);

      // Sort individual tab data
      setFixtures(rawFixtures);

      // Process Standings: Group by stage_name to support multi-group competitions (e.g. World Cup, UCL)
      let rawStandings: FootballStanding[] = [];
      const result = standingsRes.result;

      if (result) {
        if (Array.isArray(result)) {
          rawStandings = result;
        } else if (result.total && Array.isArray(result.total)) {
          rawStandings = result.total;
        }
      }

      // FILTER STANDINGS BY LATEST SEASON (Synced with Fixtures)
      if (latestSeason) {
        rawStandings = rawStandings.filter((s) => s.league_season === latestSeason);
      }

      const groupedStandings: { [key: string]: FootballStanding[] } = {};
      const processedGroups = new Set<string>();

      rawStandings.forEach((s) => {
        // Try to find the most specific group name
        let groupName = s.stage_name || 'League Table';

        // Normalize variations
        if (groupName === 'League Stage' || groupName === 'League Phase') {
          groupName = 'League Table';
        }

        const specificGroup = (s as any).group || (s as any).league_group;
        const round = s.league_round;

        // Priority 1: Specific Group found in hidden fields
        if (specificGroup) {
          groupName = specificGroup;
        }
        // Priority 2: Use Round Logic
        else if (round && round.length < 25) {
          if (groupName === 'Group Stage' || groupName === 'League Table') {
            groupName = round;
          } else if (round !== groupName && !groupName.includes(round)) {
            // Concatenate for cases like "League A" + "Group 1"
            groupName = `${groupName} - ${round}`;
          }
        }

        groupName = groupName.trim();

        if (!groupedStandings[groupName]) {
          groupedStandings[groupName] = [];
        }
        groupedStandings[groupName].push(s);
      });

      // Remove generic "Group Stage" if specific groups exist
      if (Object.keys(groupedStandings).length > 1 && groupedStandings['Group Stage']) {
        delete groupedStandings['Group Stage'];
      }

      // Convert to array and sort groups
      const standingsData = Object.entries(groupedStandings).map(([name, teams]) => ({
        name,
        teams: teams.sort((a, b) => parseInt(a.standing_place) - parseInt(b.standing_place)),
      }));

      // Sort groups alphabetically (e.g. Group A, Group B, ...)
      standingsData.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

      setStandings(standingsData);

      setTopscorers(topscorersRes.result || []);

      // Merge team data (Web App Logic)
      const teamMap = new Map<string, FootballTeam>();
      if (teamsRes.result) {
        teamsRes.result.forEach((t: FootballTeam) => teamMap.set(String(t.team_key), t));
      }

      // Supplement logos from fixtures
      rawFixtures.forEach((f: FootballEvent) => {
        if (f.home_team_key && f.home_team_logo) {
          const key = String(f.home_team_key);
          const existing = teamMap.get(key);
          if (!existing) {
            teamMap.set(key, {
              team_key: key,
              team_name: f.event_home_team,
              team_logo: f.home_team_logo,
            } as FootballTeam);
          } else if (!existing.team_logo || existing.team_logo === '') {
            existing.team_logo = f.home_team_logo;
          }
        }
        if (f.away_team_key && f.away_team_logo) {
          const key = String(f.away_team_key);
          const existing = teamMap.get(key);
          if (!existing) {
            teamMap.set(key, {
              team_key: key,
              team_name: f.event_away_team,
              team_logo: f.away_team_logo,
            } as FootballTeam);
          } else if (!existing.team_logo || existing.team_logo === '') {
            existing.team_logo = f.away_team_logo;
          }
        }
      });
      setTeams(Array.from(teamMap.values()));

      // Predictions for today
      const todayStr = new Date().toISOString().split('T')[0];
      const probRes = await advancedFootballApi
        .getProbabilities({ leagueId, from: todayStr, to: todayStr })
        .catch(() => ({ result: [] }));
      setProbabilities(probRes?.result || []);
    } catch (error) {
      console.error('Error loading league data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: '#080E18', padding: 16 }}>
        <LeagueRibbonSkeleton />
        <StandingsTableSkeleton />
        <MatchCardSkeleton />
      </View>
    );
  }

  if (!league) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>League not found</Text>
      </View>
    );
  }

  const renderStandingsTable = () => {
    const getTeamLogo = (teamKey: string) => {
      const team = teams.find((t) => String(t.team_key) === String(teamKey));
      return team?.team_logo;
    };

    return (
      <View>
        {standings.map((group, groupIndex) => (
          <View key={`group-${groupIndex}`} style={styles.standingsGroup}>
            {standings.length > 1 && <Text style={styles.groupTitle}>{group.name}</Text>}
            <View style={styles.standingsTable}>
              {/* Header */}
              <View style={styles.standingsHeader}>
                <Text style={[styles.standingsHeaderText, styles.posCol]}>#</Text>
                <Text style={[styles.standingsHeaderText, styles.teamCol]}>Team</Text>
                <Text style={[styles.standingsHeaderText, styles.statCol]}>P</Text>
                <Text style={[styles.standingsHeaderText, styles.statCol, { color: '#34D399' }]}>W</Text>
                <Text style={[styles.standingsHeaderText, styles.statCol, { color: '#94A3B8' }]}>D</Text>
                <Text style={[styles.standingsHeaderText, styles.statCol, { color: '#F87171' }]}>L</Text>
                <Text style={[styles.standingsHeaderText, styles.statCol]}>GD</Text>
                <Text style={[styles.standingsHeaderText, styles.ptsCol, { color: '#FBBF24' }]}>Pts</Text>
              </View>

              {/* Rows */}
              {group.teams.map((standing, index) => {
                const teamLogo = getTeamLogo(standing.team_key);
                const rank = Number(standing.standing_place) || index + 1;
                const isLeader = rank === 1;
                const isUCL = rank >= 1 && rank <= 4;
                const isUEL = rank === 5;
                const isUECL = rank === 6;
                const isRel = group.teams.length > 10 ? rank >= group.teams.length - 2 : rank >= 18;

                return (
                  <Pressable
                    key={`${group.name || 'group'}-${standing.team_key || 'unknown'}-${index}`}
                    style={[
                      styles.standingsRow,
                      isUCL && styles.championsLeagueRow,
                      isUEL && styles.europaLeagueRow,
                      isUECL && styles.conferenceLeagueRow,
                      isRel && styles.relegationRow,
                    ]}
                    onPress={() => {
                      if (standing.team_key) {
                        const slug = buildTeamSlug(standing.standing_team, standing.team_key);
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
                          styles.posColText,
                          isLeader && { color: '#FBBF24', fontWeight: '900' },
                          !isLeader && isUCL && { color: '#60A5FA' },
                          isUEL && { color: '#FBBF24' },
                          isUECL && { color: '#34D399' },
                          isRel && { color: '#F87171' },
                        ]}
                      >
                        {standing.standing_place}
                      </Text>
                    </View>
                    <View style={styles.teamColContainer}>
                      {teamLogo ? (
                        <Image source={{ uri: teamLogo }} style={styles.standingsTeamLogo} />
                      ) : null}
                      <Text style={[styles.standingsText, styles.teamColText]} numberOfLines={1}>
                        {standing.standing_team}
                      </Text>
                    </View>
                    <Text style={[styles.standingsText, styles.statCol]}>
                      {standing.standing_P}
                    </Text>
                    <Text style={[styles.standingsText, styles.statCol, { color: '#34D399' }]}>
                      {standing.standing_W}
                    </Text>
                    <Text style={[styles.standingsText, styles.statCol, { color: '#94A3B8' }]}>
                      {standing.standing_D}
                    </Text>
                    <Text style={[styles.standingsText, styles.statCol, { color: '#F87171' }]}>
                      {standing.standing_L}
                    </Text>
                    <Text style={[styles.standingsText, styles.statCol]}>
                      {standing.standing_GD}
                    </Text>
                    <View style={styles.ptsPillContainer}>
                      <Text style={[styles.standingsText, styles.ptsCol, styles.ptsValue]}>
                        {standing.standing_PTS}
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
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderTopscorers = () => {
    const getTeamLogo = (teamKey: string) => {
      const team = teams.find((t) => String(t.team_key) === String(teamKey));
      return team?.team_logo;
    };

    const sortedScorers = [...topscorers].sort((a, b) => {
      const goalsA = parseInt(a.goals) || 0;
      const goalsB = parseInt(b.goals) || 0;
      if (goalsB !== goalsA) return goalsB - goalsA;
      const assistsA = parseInt(a.assists || '0') || 0;
      const assistsB = parseInt(b.assists || '0') || 0;
      return assistsB - assistsA;
    });

    return (
      <View style={styles.topscorersContainer}>
        {sortedScorers.map((scorer) => {
          const teamLogo = getTeamLogo(scorer.team_key);
          return (
            <Pressable
              key={scorer.player_key}
              style={styles.topscorerCard}
              onPress={() => router.push(`/home/football/players/${scorer.player_key}` as any)}
            >
              <View style={styles.topscorerRank}>
                <Text style={styles.topscorerRankText}>{scorer.player_place}</Text>
              </View>
              <View style={styles.topscorerInfo}>
                <Text style={styles.topscorerName}>{scorer.player_name}</Text>
                <View style={styles.topscorerTeamContainer}>
                  {teamLogo && (
                    <Image source={{ uri: teamLogo }} style={styles.topscorerTeamLogo} />
                  )}
                  <Text style={styles.topscorerTeam}>{scorer.team_name}</Text>
                </View>
              </View>
              <View style={styles.topscorerStats}>
                <View style={styles.topscorerStat}>
                  <Text style={styles.topscorerStatValue}>⚽ {scorer.goals}</Text>
                  <Text style={styles.topscorerStatLabel}>Goals</Text>
                </View>
                {scorer.assists && (
                  <View style={styles.topscorerStat}>
                    <Text style={styles.topscorerStatValue}>🎯 {scorer.assists}</Text>
                    <Text style={styles.topscorerStatLabel}>Assists</Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </Pressable>
          {league.league_logo && (
            <Image source={{ uri: league.league_logo }} style={styles.leagueLogo} />
          )}
          <View style={styles.headerText}>
            <Text style={styles.leagueName}>{league.league_name}</Text>
            <Pressable
              style={styles.countryInfo}
              onPress={() => {
                if (league.country_key) {
                  router.push(`/home/football/countries/${league.country_key}` as any);
                }
              }}
            >
              {league.country_logo && (
                <Image source={{ uri: league.country_logo }} style={styles.countryFlag} />
              )}
              <Text style={styles.countryName}>{league.country_name}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(
            [
              'fixtures',
              'results',
              'standings',
              'topscorers',
              'teams',
              'predictions',
            ] as LeagueTab[]
          ).map((t) => {
            const LABELS: Record<LeagueTab, string> = {
              fixtures: 'Fixtures',
              results: 'Results',
              standings: 'Standings',
              topscorers: 'Scorers',
              teams: 'Teams',
              predictions: 'AI Odds',
            };
            return (
              <Pressable
                key={t}
                style={[styles.tab, activeTab === t && styles.activeTab]}
                onPress={() => setActiveTab(t)}
              >
                <Text style={[styles.tabText, activeTab === t && styles.activeTabText]}>
                  {LABELS[t]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      {/* Standings Toggle */}
      {activeTab === 'standings' && (
        <View style={styles.standingToggleRow}>
          {(['total', 'home', 'away'] as const).map((v) => (
            <Pressable
              key={v}
              style={[
                styles.standingToggleBtn,
                standingView === v && styles.standingToggleBtnActive,
              ]}
              onPress={() => setStandingView(v)}
            >
              <Text
                style={[styles.standingToggleLabel, standingView === v && { color: '#F8FAFC' }]}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />
        }
      >
        {activeTab === 'fixtures' && (
          <View style={styles.section}>
            {fixtures
              .filter((f) => {
                const status = f.event_status?.toLowerCase();
                const isFinished =
                  status === 'finished' ||
                  f.event_status === 'FT' ||
                  f.event_status === 'AET' ||
                  f.event_status === 'AP';
                if (isFinished) return false;

                // Filter for next 90 days
                const eventDate = new Date(`${f.event_date} ${f.event_time || '00:00'}`);
                const now = new Date();
                now.setHours(0, 0, 0, 0); // Start of today
                const dayDiff = (eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24);

                return dayDiff >= 0 && dayDiff <= 90;
              })
              .sort(
                (a, b) =>
                  new Date(`${a.event_date} ${a.event_time || '00:00'}`).getTime() -
                  new Date(`${b.event_date} ${b.event_time || '00:00'}`).getTime()
              )
              .map((event, index) => (
                <FootballMatchCard key={`fixture-${event.event_key || index}`} event={event} />
              ))}
            {fixtures.filter((f) => {
              const status = f.event_status?.toLowerCase();
              return (
                status !== 'finished' &&
                f.event_status !== 'FT' &&
                f.event_status !== 'AET' &&
                f.event_status !== 'AP'
              );
            }).length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No upcoming matches available</Text>
              </View>
            )}
          </View>
        )}
        {activeTab === 'results' && (
          <View style={styles.section}>
            {fixtures
              .filter((f) => {
                const status = f.event_status?.toLowerCase();
                return (
                  status === 'finished' ||
                  f.event_status === 'FT' ||
                  f.event_status === 'AET' ||
                  f.event_status === 'AP'
                );
              })
              .sort(
                (a, b) =>
                  new Date(`${b.event_date} ${b.event_time || '00:00'}`).getTime() -
                  new Date(`${a.event_date} ${a.event_time || '00:00'}`).getTime()
              )
              .map((event, index) => (
                <FootballMatchCard key={`result-${event.event_key || index}`} event={event} />
              ))}
            {fixtures.filter((f) => {
              const status = f.event_status?.toLowerCase();
              return (
                status === 'finished' ||
                f.event_status === 'FT' ||
                f.event_status === 'AET' ||
                f.event_status === 'AP'
              );
            }).length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No recent results available</Text>
              </View>
            )}
          </View>
        )}
        {activeTab === 'standings' && (
          <View style={styles.section}>
            {standings.length > 0 ? (
              renderStandingsTable()
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No standings available</Text>
              </View>
            )}
          </View>
        )}
        {activeTab === 'topscorers' && (
          <View style={styles.section}>
            {topscorers.length > 0 ? (
              renderTopscorers()
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No top scorers available</Text>
              </View>
            )}
          </View>
        )}
        {/* ── TEAMS TAB ── */}
        {activeTab === 'teams' && (
          <View style={styles.section}>
            {teams.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No teams data available</Text>
              </View>
            ) : (
              <View style={styles.teamsGrid}>
                {teams.map((t, i) => (
                  <Pressable
                    key={i}
                    style={styles.teamCard}
                    onPress={() => {
                      if (t.team_key) {
                        const slug = buildTeamSlug(t.team_name, t.team_key);
                        router.push(`/home/football/teams/${slug}` as any);
                      }
                    }}
                  >
                    {t.team_logo ? (
                      <Image source={{ uri: t.team_logo }} style={styles.teamCardLogo} />
                    ) : (
                      <View
                        style={[
                          styles.teamCardLogo,
                          {
                            backgroundColor: '#1E293B',
                            alignItems: 'center',
                            justifyContent: 'center',
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 22 }}>🛡️</Text>
                      </View>
                    )}
                    <Text style={styles.teamCardName} numberOfLines={2}>
                      {t.team_name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}
        {/* ── PREDICTIONS TAB ── */}
        {activeTab === 'predictions' && (
          <View style={styles.section}>
            {probabilities.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No predictions for today in this league.</Text>
              </View>
            ) : (
              probabilities.map((item, i) => {
                const hw = Number(item.event_HW) || 0;
                const d = Number(item.event_D) || 0;
                const aw = Number(item.event_AW) || 0;
                return (
                  <Pressable
                    key={i}
                    style={styles.predCard}
                    onPress={() => {
                      if (item.event_key) {
                        const slug = buildMatchSlug(item);
                        router.push(`/home/football/matches/${slug}` as any);
                      }
                    }}
                  >
                    <View style={styles.predTeams}>
                      <Text style={styles.predHome} numberOfLines={1}>
                        {item.event_home_team}
                      </Text>
                      <Text style={styles.predVS}>VS</Text>
                      <Text style={styles.predAway} numberOfLines={1}>
                        {item.event_away_team}
                      </Text>
                    </View>
                    <View style={styles.predBarLabels}>
                      <Text style={[styles.predBarLabel, { color: '#60A5FA' }]}>{hw}%</Text>
                      <Text style={[styles.predBarLabel, { color: '#94A3B8' }]}>D {d}%</Text>
                      <Text style={[styles.predBarLabel, { color: '#FBBF24' }]}>{aw}%</Text>
                    </View>
                    <View style={styles.predBar}>
                      <View style={{ flex: hw || 1, backgroundColor: '#2563EB', height: '100%' }} />
                      <View style={{ flex: d || 1, backgroundColor: '#475569', height: '100%' }} />
                      <View style={{ flex: aw || 1, backgroundColor: '#D97706', height: '100%' }} />
                    </View>
                    <View style={styles.predMetrics}>
                      <Text style={styles.predMetric}>
                        Over 2.5: <Text style={{ color: '#34D399' }}>{item.event_O}%</Text>
                      </Text>
                      <Text style={styles.predMetric}>
                        BTS: <Text style={{ color: '#FBBF24' }}>{item.event_bts}%</Text>
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.danger,
  },
  header: {
    backgroundColor: 'rgba(0, 31, 63, 0.9)',
    padding: SPACING.md,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.secondary,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leagueLogo: {
    width: 40,
    height: 40,
    marginRight: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  headerText: {
    flex: 1,
  },
  leagueName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  countryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryFlag: {
    width: 24,
    height: 24,
    marginRight: SPACING.xs,
    borderRadius: BORDER_RADIUS.xs,
  },
  countryName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  tabsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minWidth: 70,
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeTabText: {
    color: '#60A5FA',
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  standingsTable: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  standingsHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
  },
  standingsHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  standingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  championsLeagueRow: {
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  europaLeagueRow: {
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  conferenceLeagueRow: {
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  relegationRow: {
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
  posColText: {
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
    paddingHorizontal: 12,
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
  standingsText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  posCol: {
    width: 22,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  teamCol: {
    flex: 1,
    textAlign: 'left',
    paddingLeft: 6,
  },
  statCol: {
    width: 23,
    textAlign: 'center',
  },
  ptsCol: {
    width: 28,
    textAlign: 'center',
  },
  ptsValue: {
    fontWeight: '900',
    color: '#FBBF24',
    fontSize: 12,
  },
  teamColContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 6,
    paddingRight: 4,
  },
  teamColText: {
    flex: 1,
    textAlign: 'left',
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    fontFamily: 'System',
  },
  standingsTeamLogo: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  topscorersContainer: {
    gap: SPACING.md,
  },
  topscorerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: SPACING.sm,
  },
  topscorerRank: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  topscorerRankText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.background,
  },
  topscorerInfo: {
    flex: 1,
  },
  topscorerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.background,
    marginBottom: 2,
  },
  topscorerTeamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topscorerTeamLogo: {
    width: 14,
    height: 14,
    marginRight: SPACING.xs,
  },
  topscorerTeam: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  topscorerStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  topscorerStat: {
    alignItems: 'center',
  },
  topscorerStatValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  topscorerStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  standingsGroup: {
    marginBottom: SPACING.lg,
  },
  groupTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.xs,
  },
  // Standings toggle
  standingToggleRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: COLORS.backgroundDark,
  },
  standingToggleBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  standingToggleBtnActive: { backgroundColor: '#1D4ED8', borderColor: '#3B82F6' },
  standingToggleLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  // Teams tab
  teamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 4,
  },
  teamCard: {
    width: '30%',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0B1526',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  teamCardLogo: { width: 52, height: 52, resizeMode: 'contain', borderRadius: 8 },
  teamCardName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#CBD5E1',
    textAlign: 'center',
  },
  // Predictions
  predCard: {
    backgroundColor: '#0B1526',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
    marginBottom: 8,
  },
  predTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  predHome: { flex: 1, fontSize: 12, fontWeight: '800', color: '#60A5FA' },
  predVS: { fontSize: 10, color: '#475569', marginHorizontal: 8 },
  predAway: { flex: 1, fontSize: 12, fontWeight: '800', color: '#FBBF24', textAlign: 'right' },
  predBarLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  predBarLabel: { fontSize: 10, fontWeight: '800', fontFamily: 'monospace' },
  predBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    marginBottom: 8,
  },
  predMetrics: { flexDirection: 'row', gap: 16 },
  predMetric: { fontSize: 11, color: '#94A3B8', fontWeight: '700' },
});
